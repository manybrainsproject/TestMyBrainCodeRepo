/*

    Copyright 2023 The Many Brains Project, Inc. and McLean Hospital.

    This code is made available under a GNU Lesser General Public License 3.0
    (LGPLv3).
    https://www.gnu.org/licenses/lgpl-3.0.html.

    Author: Paolo Martini
    Last updated: 04.13.2023
    Version: chooseInput.v1.Apr23

*/

function chooseInput(inputTypes, callback)
{
    /* Given valid inputTypes {'keyboard','mouse','touch'}, it returns
       the user's choice as one of ['keys','clicks','taps']

       Usage:

         chooseInput({keyboard: true, mouse: false, touch: true},
                     function(input) {console.log(input);});
    */

    var lang, els, msg = '', errMsg = '&nbsp', oldAction = '', divs = [];
    var centeredTable, centeredCell, chooseInputBox, choiceSpan, errSpan;

    if(inputTypes === null || typeof inputTypes !== 'object')
        throw new TypeError("chooseInput: missing or invalid inputTypes object.");
    inputTypes.keyboard = inputTypes.keyboard || false;
    inputTypes.mouse = inputTypes.mouse || false;
    inputTypes.touch = inputTypes.touch || false;

    // dictionary
    els = [{'en': 'Keyboard', // 0
            'es': 'Teclado',
            'fr': 'Clavier'},
        {'en': 'Touch', // 1
         'es': 'Pantalla táctil',
         'fr': 'Touche'},
        {'en': 'Mouse / Trackpad', // 2
         'es': 'Mouse / Trackpad',
         'fr': 'Souris / pavé tactile'},
        {'en': 'Pen', // 3
         'es': 'El lápiz óptico',
         'fr': 'Stylo'},
        {'en': ' not valid for this test: try another input.', // 4
         'es': ' no es válido para esta prueba: intenté con otra entrada.',
         'fr': ' non valide pour ce test: essayez une autre entrée.'},
        {'en': '<h3>Please click or tap here<br>to choose how you will<br>respond in this test.</h3>', // 5
         'es': '<h3>Por favor presione aquí para elegir cómo responderá en esta prueba.</h3>',
         'fr': '<h3>Veuillez cliquer ici pour choisir comment vous allez répondre à ce test.</h3>'},
        {'en': '- To use a <b>keyboard</b>, <b>press any key</b> now.<br><br>', // 6
         'es': '- Para usar <b>un teclado</b>, <b>presione cualquier tecla</b> ahora.<br><br>',
         'fr': '- Pour utiliser le <b>clavier</b>, <b>appuyez sur une touche</b> maintenant.<br><br>'},
        {'en': '- To use a <b>mouse</b> or <b>trackpad</b>, <b>click here</b> now.<br><br>', // 7
         'es': '- Para utilizar <b>un mouse</b> o <b>un trackpad</b>, <b>presione aquí</b> ahora.<br><br>',
         'fr': '- Pour utiliser une <b>souris</b> ou un <b>pavé tactile</b>, <b>cliquez ici </b> maintenant.<br><br>'},
        {'en': '- To use a <b>touch screen</b>, <b>touch here</b> now.<br><br>', // 8
         'es': '- Para utilizar <b>una pantalla táctil</b>, <b>toque aquí</b> ahora.<br><br>',
         'fr': '- Pour utiliser un <b>écran tactile</b>, <b>touchez ici</b> maintenant.'}];

    // get the language
    lang = document.documentElement.lang;
    if(!els[0][lang]) lang = 'en';

    // choice event handler
    function getinput(e)
    {
        var input;
        errMsg = '';

        e.preventDefault();
        e.stopPropagation();

        // identify the event and validate by allowed input types;
        // the order of checking is IMPORTANT:
        // - pointer events with pen device will output pen->touch
        //   in Chrome
        if(e.type === 'keyup')
        {
            if(inputTypes.keyboard) input = 'keys';
            else errMsg = els[0][lang];
        }
        else if(e.type === 'pointerup' || e.type === 'MSPointerUp')
        {
            if(e.pointerType === 'touch' || e.pointerType === e.MSPOINTER_TYPE_TOUCH)
            {
                if(inputTypes.touch) input = 'taps';
                else errMsg = els[1][lang];
            }
            else if(e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)
            {
                if(inputTypes.mouse) input = 'clicks';
                else errMsg = els[2][lang];
            }
            else if(e.pointerType === 'pen' || e.pointerType === e.MSPOINTER_TYPE_PEN)
            {
                if(inputTypes.touch) input = 'taps';
                else errMsg = els[3][lang];
            }
        }
        else if(e.type === 'touchend')
        {
            if(inputTypes.touch) input = 'taps';
            else errMsg = els[1][lang];
        }
        else if(e.type === 'mouseup')
        {
            if(inputTypes.mouse) input = 'clicks';
            else errMsg = els[2][lang];
        }

        // warn if the user entered an invalid input
        if(errMsg) errMsg += els[4][lang];
        errSpan.innerHTML = errMsg;

        // if we got a valid input, remove the listeners,
        // remove the chooseInput div from the DOM, restore original display
        // mode for other divs and return the input type
        // to the callback function
        if(input)
        {
            document.removeEventListener("keyup",getinput,true);
            if("ontouchend" in window ||
               navigator.maxTouchPoints ||
               navigator.msMaxTouchPoints) document.removeEventListener("touchend",getinput,true);
            document.removeEventListener("mouseup",getinput,true);
            if(window.PointerEvent)
                document.removeEventListener("pointerup",getinput,true);
            else if(window.MSPointerEvent)
                document.removeEventListener("MSPointerUp",getinput,true);

            if('touchAction' in document.body.style)
                document.body.style.touchAction = oldAction;
            else if ('msTouchAction' in document.body.style)
                document.body.style.msTouchAction = oldAction;

            centeredTable.remove();

            divs.forEach(function(d)
            {
                d[0].style.display = d[1];
            });

            if(callback) callback(input);
        }
    }

    function setup()
    {
        // prevent default touch action
        if('touchAction' in document.body.style)
        {
            oldAction = document.body.style.touchAction;
            document.body.style.touchAction = 'none';
        }
        else if ('msTouchAction' in document.body.style)
        {
            oldAction = document.body.style.msTouchAction;
            document.body.style.msTouchAction = 'none';
        }

        // setup input listeners
        document.addEventListener("keyup",getinput,true);
        document.addEventListener("mouseup",getinput,true);
        if("ontouchend" in window ||
           navigator.maxTouchPoints ||
           navigator.msMaxTouchPoints) document.addEventListener("touchend",getinput,true);
        if(window.PointerEvent)
            document.addEventListener("pointerup",getinput,true);
        else if(window.MSPointerEvent)
            document.addEventListener("MSPointerUp",getinput,true);
    }

    function trigger()
    {
        msg = '';
        if(inputTypes.keyboard)
            msg += els[6][lang];
        if(inputTypes.mouse)
            msg += els[7][lang];
        if(inputTypes.touch)
            msg += els[8][lang];

        chooseInputBox.style.textAlign = 'left';
        choiceSpan.innerHTML = msg;
        chooseInputBox.removeEventListener('click', trigger, true);
        setup();
    }

    // hide all existing divs
    [].forEach.call(document.getElementsByTagName("div"), function (d)
    {
        divs.push([d,window.getComputedStyle(d).getPropertyValue('display')]);
        d.style.display = 'none';
    });

    // create elements to output the choice message
    centeredTable = document.createElement('div');
    centeredTable.id = 'centeredTable';
    centeredTable.style.boxSizing = 'border-box';
    centeredTable.style.display = 'table';
    centeredTable.style.margin = 'auto';
    centeredTable.style.height = 'inherit';//document.body.clientHeight + "px";
    centeredTable.style.width = 'inherit';//document.body.clientWidth + "px";
    centeredTable.style.padding = '0 5% 0 5%';
    centeredTable.style.textAlign = 'center';
    centeredTable.style.fontFamily = '\"Helvetica Neue\",Helvetica,Arial,sans-serif';
    document.body.appendChild(centeredTable);

    centeredCell = document.createElement('div');
    centeredCell.id = 'centeredCell';
    centeredCell.style.display = 'table-cell';
    centeredCell.style.verticalAlign = 'middle';
    centeredTable.appendChild(centeredCell);

    chooseInputBox = document.createElement('div');
    chooseInputBox.id = 'chooseInput';
    chooseInputBox.style.margin = 'auto';
    chooseInputBox.style.maxWidth = '450px';
    chooseInputBox.style.border = 'solid 2px #f1c40f';
    chooseInputBox.style.borderRadius = '1em';
    chooseInputBox.style.background = '#f7f7f7';
    chooseInputBox.style.padding = '10px';
    chooseInputBox.style.fontSize = '18pt';
    centeredCell.appendChild(chooseInputBox);

    choiceSpan = document.createElement('span');
    choiceSpan.id = 'choiceMsg';
    chooseInputBox.appendChild(choiceSpan);
    choiceSpan.innerHTML = els[5][lang];

    errSpan = document.createElement('span');
    errSpan.id = 'errMsg';
    errSpan.style.color = 'red';
    errSpan.style.fontSize = '14pt';
    chooseInputBox.appendChild(errSpan);
    errSpan.innerHTML = '&nbsp';

    // trigger the choice
    chooseInputBox.addEventListener('click', trigger, true);
}

