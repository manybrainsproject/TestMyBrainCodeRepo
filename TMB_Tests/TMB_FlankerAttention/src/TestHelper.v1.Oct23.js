/*

 Copyright 2023 The Many Brains Project, Inc. and McLean Hospital.

 This code is made available under a GNU Lesser General Public License 3.0
 (LGPLv3).
 https://www.gnu.org/licenses/lgpl-3.0.html.

 Author: Paolo Martini, Roger Strong
 Last updated: 10.19.2023
 Version: TestHelper.v1.Oct23

 */

function debounce(func, wait, immediate)
{
    /*
     Returns a function, that, as long as it continues to be invoked,
     will not be triggered. The function will be called after it stops
     being invoked for `wait` milliseconds. If `immediate` is passed,
     the function is triggered on the leading edge, instead of the trailing.

     Usage:

     var resizeHandler = debounce(function() { your code here }, 100);
     window.addEventListener('resize', resizeHandler);

     N.B. The event is passed to the returned function as arguments[0]
     */

    var timeout;
    return function ()
    {
        var context = this, args = arguments;
        var later = function ()
        {
            timeout = null;
            if (!immediate)
            {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
        {
            func.apply(context, args);
        }
    };
}

function disableSelect()
{
    var s = document.body.style;

    if (typeof s.webkitUserSelect !== "undefined") s.webkitUserSelect = "none";
    else if (typeof s.MozUserSelect !== "undefined") s.MozUserSelect = "none";
    else if (typeof s.msUserSelect !== "undefined") s.msUserSelect = "none";
    else if (typeof s.oUserSelect !== "undefined") s.oUserSelect = "none";
    else if (typeof s.userSelect !== "undefined") s.userSelect = "none";
    else if (typeof document.onselectstart !== "undefined")
        document.onselectstart = function ()
        {
            return false;
        };

    // disable 'save image' popup on iPhone
    if (s.webkitTouchCallout !== undefined) s.webkitTouchCallout = 'none';
}

tmbUI.getInput = function ()
{
    var i, timeStamp = now(), downDebounce = false, upDebounce = true,
        highlightEl, errorMessage = "", validUpEventTypes = [];

    // parse the tmbUI object
    for (var key in tmbUI)
    {
        // filter out prototype properties
        if (tmbUI.hasOwnProperty(key))
        {
            switch (key)
            {
                // keys, clicks or taps
                case "UIevents":
                    // must specify input events
                    if (tmbUI.UIevents.length === 0)
                    {
                        errorMessage += "Must specify UIevents: " +
                                        "'keys', 'clicks' or 'taps'. ";
                    }
                    // accept single argument not as array
                    if (!(tmbUI.UIevents instanceof Array))
                    {
                        tmbUI.UIevents = [tmbUI.UIevents];
                    }
                    // veto invalid events
                    for (i = 0; i < tmbUI.UIevents.length; i++)
                    {
                        if (!["keys", "clicks", "taps"].includes(tmbUI.UIevents[i]))
                        {
                            errorMessage += "'" + tmbUI.UIevents[i] +
                                            "' is not a valid event. ";
                        }
                    }
                    // are touch events available?
                    if (tmbUI.UIevents.includes("taps") && !hasTouch && !hasPointer)
                    {
                        errorMessage += "'taps' is not a valid event. ";
                    }
                    break;
                // valid keyboard keys
                case "UIkeys":
                    // accept single argument not as array
                    if (!(tmbUI.UIkeys instanceof Array))
                    {
                        tmbUI.UIkeys = [tmbUI.UIkeys];
                    }
                    // keys must be valid keycodes
                    for (i = 0; i < tmbUI.UIkeys.length; i++)
                    {
                        if (!keyboardCodes[tmbUI.UIkeys[i]])
                        {
                            errorMessage += "'" + tmbUI.UIkeys[i] +
                                            "' is not a valid keyboard code. ";
                        }
                    }
                    break;
                // ids of elements to attach listeners to,
                // or corresponding to keys
                case "UIelements":
                    // accept single argument not as array
                    if (!(tmbUI.UIelements instanceof Array))
                    {
                        tmbUI.UIelements = [tmbUI.UIelements];
                    }
                    // must be DOM elements
                    for (i = 0; i < tmbUI.UIelements.length; i++)
                    {
                        if (!getID(tmbUI.UIelements[i]))
                        {
                            errorMessage += "'" + tmbUI.UIelements[i] +
                                            "' is not a valid element. ";
                        }
                    }
                    break;
                // listening timeout in ms
                case "timeout":
                    // minimum timeout is 150 ms
                    if (tmbUI.timeout < 150)
                        errorMessage += "Timeout is " +
                                        tmbUI.timeout + " ms, " +
                                        "must be > 150 ms. ";
                    break;
                // function has not raised readyUI event yet
                case "timeoutRef":
                    // called this function while still processing
                    if (tmbUI.timeoutRef !== 0)
                    {
                        tmbUI.message += "'getInput' called again while " +
                                         "still busy. ";
                        return false;
                    }
                    break;
                // do we want to highlight the element
                // the user responds to?
                case "highlight":
                    // must be empty string or valid css class
                    if (tmbUI.highlight !== "")
                    {
                        var found = [].slice.call(document.styleSheets).some(function(sheet)
                        {
                            return [].slice.call(sheet.cssRules).some(function(rule)
                            {
                                return rule.selectorText === '.'+tmbUI.highlight;
                            });
                        });
                        if(!found)
                        {
                            errorMessage += "'highlight' must be " +
                                            "empty string or valid CSS class. ";
                        }
                    }
                    break;
                case "onreadyUI":
                    break;
                case "getInput":
                    break;
                case "status":
                    tmbUI.status = "";
                    break;
                case "message":
                    tmbUI.message = "";
                    break;
                case "response":
                    tmbUI.response = "";
                    break;
                case "downTimestamp":
                    tmbUI.downTimestamp = 0;
                    break;
                case "rt":
                    tmbUI.rt = 0;
                    break;
                case "upTimestamp":
                    tmbUI.upTimestamp = 0;
                    break;
                case "dwell":
                    tmbUI.dwell = 0;
                    break;
                default:
                    errorMessage += "Invalid parameter '" +
                        key + "'. ";
            }
        }
    }

    // need event "keys" for valid keys
    if ((tmbUI.UIkeys.length > 0) && !tmbUI.UIevents.includes("keys"))
        errorMessage += "Need 'keys' in UIevents for valid keys. ";
    //  valid keys and elements must be same number
    if (tmbUI.UIkeys.length &&
        tmbUI.UIelements.length &&
        (tmbUI.UIelements.length < tmbUI.UIkeys.length))
        errorMessage += "Invalid number of UIelements, " +
                        "more 'keys' than 'UIelements'. ";
    // elements must be specified for highlighting
    if (tmbUI.UIelements.length === 0 && tmbUI.highlight !== "")
        errorMessage += "No elements to highlight. ";

    // error handler
    if (errorMessage)
    {
        tmbUI.status = "error";
        tmbUI.message = errorMessage;

        // fire readyUI event
        var readyUI = new CustomEvent("readyUI");
        document.addEventListener("readyUI", tmbUI.onreadyUI, true);
        document.dispatchEvent(readyUI);
        document.removeEventListener("readyUI", tmbUI.onreadyUI, true);

        return false;
    }

    // down event listener
    function downResponseHandler(e)
    {
        var responseEvent, r;

        responseEvent = e;//|| window.event;

        // prevent bubbling
        if (responseEvent.cancelable) responseEvent.preventDefault();
        responseEvent.stopPropagation();

        // process input only on first hit (i.e. debounce)
        if (downDebounce === false)
        {
            // process keyboard input for keys
            if (tmbUI.UIevents.includes("keys") && responseEvent.type === "keydown")
            {
                r = responseEvent.charCode || responseEvent.keyCode;

                // key must be valid
                if (tmbUI.UIkeys.includes(r) || tmbUI.UIkeys.length === 0)
                {
                    // determine response identity
                    tmbUI.response = codeToKey(r);

                    // determine the element to highlight
                    if (tmbUI.highlight !== "" && tmbUI.UIkeys.length > 0)
                        highlightEl = getID(tmbUI.UIelements[tmbUI.UIkeys.indexOf(r)]);

                    // set the debounce flags:
                    // - down event detected and debounced, so we don't record
                    //   the same down event multiple times, e.g. on autorepeat
                    // - up event not yet detected
                    downDebounce = true;
                    upDebounce = false;
                    validUpEventTypes = ['keyup'];
                }
            }
            // process mouse and pointer input for clicks
            if (tmbUI.UIevents.includes("clicks"))
            {
                if (responseEvent.type === "mousedown" ||
                    (responseEvent.type === "pointerdown" &&
                        responseEvent.pointerType === 'mouse') ||
                    (responseEvent.type === "MSPointerDown" &&
                        responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_MOUSE))
                {
                    if (tmbUI.UIelements.length === 0) tmbUI.response = "document";
                    else tmbUI.response = responseEvent.target
                                          ? responseEvent.target.id
                                          : responseEvent.srcElement.id;

                    if (tmbUI.highlight !== "")
                        highlightEl = getID(tmbUI.response);

                    downDebounce = true;
                    upDebounce = false;
                    validUpEventTypes = ['mouseup','pointerup-mouse',
                                         'MSPointerUp-mouse'];
                }
            }
            // process touch and pointer input for taps
            if (tmbUI.UIevents.includes("taps"))
            {
                if (responseEvent.type === "touchstart" ||
                    (responseEvent.type === "pointerdown" &&
                     (responseEvent.pointerType === 'touch' ||
                      responseEvent.pointerType === 'pen')) ||
                    (responseEvent.type === "MSPointerDown" &&
                     (responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_TOUCH ||
                      responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_PEN)))
                {
                    if (tmbUI.UIelements.length === 0) tmbUI.response = "document";
                    else tmbUI.response = responseEvent.target
                                          ? responseEvent.target.id
                                          : responseEvent.srcElement.id;

                    if (tmbUI.highlight !== "")
                        highlightEl = getID(tmbUI.response);

                    downDebounce = true;
                    upDebounce = false;
                    validUpEventTypes = ['touchend','pointerup-touch','pointerup-pen',
                                         'MSPointerUp-touch','MSPointerUp-pen'];
                }
            }

            // if valid response, compute rt,
            // clear timeout and highlight target if required
            if (downDebounce === true)
            {
                tmbUI.rt = timeStamp;
                timeStamp = now();
                tmbUI.rt = timeStamp - tmbUI.rt;
                tmbUI.rt = tmbUI.rt.round(2);
                tmbUI.downTimestamp = timeStamp;

                if (tmbUI.timeoutRef) clearTimeout(tmbUI.timeoutRef);

                if (highlightEl)
                {
                    // HTML elements
                    if (['div', 'span', 'button', 'p',
                         'img'].includes(highlightEl.tagName.toLowerCase()))
                    {
                        highlightEl.classList.add(tmbUI.highlight);
                    }
                    // SVG elements
                    else if (['circle', 'rect', 'ellipse', 'line',
                              'path', 'polygon', 'polyline', 'image',
                              'text'].includes(highlightEl.tagName.toLowerCase()))
                    {
                        highlightEl.classList.add(tmbUI.highlight);
                    }
                }
            }

        }
    }

    // up event listener
    function upResponseHandler(e)
    {
        var responseEvent;
        var MSetypes = ['', '', 'touch', 'pen', 'mouse'];
        var upType;

        responseEvent = e;// || window.event;

        // prevent bubbling
        if (responseEvent.cancelable) responseEvent.preventDefault();
        responseEvent.stopPropagation();

        // determine the up-event type
        upType = responseEvent.type;
        if (upType === "pointerup") upType += ("-" + responseEvent.pointerType);
        else if (upType === "MSPointerUp") upType += ("-" + MSetypes[responseEvent.pointerType]);

        // process up-event only if preceded by valid down-event of same type
        if (downDebounce === true && upDebounce === false &&
            validUpEventTypes.includes(upType))
        {
            // compute dwell time
            tmbUI.upTimestamp = now();
            tmbUI.dwell = tmbUI.upTimestamp - timeStamp;
            tmbUI.dwell = tmbUI.dwell.round(2);

            // status returns event type
            tmbUI.status = upType;

            // don't allow another up response until
            // a valid down response has been made
            upDebounce = true;

            removeHandlers();
            returnHandler();
        }
    }

    // installs appropriate listeners depending on input type
    function installHandlers()
    {
        // listen to keyboard events
        if (tmbUI.UIevents.includes("keys"))
        {
            document.addEventListener("keydown", downResponseHandler, true);
            document.addEventListener("keyup", upResponseHandler, true);
        }
        // listen to mouse events (mouse, touchpad and pen/stylus)
        if (tmbUI.UIevents.includes("clicks"))
        {
            if (tmbUI.UIelements.length === 0)
            {
                if (window.PointerEvent)
                {
                    document.body.addEventListener("pointerdown", downResponseHandler, true);
                    document.body.addEventListener("pointerup", upResponseHandler, true);
                }
                else if (window.MSPointerEvent) // IE10
                {
                    document.body.addEventListener("MSPointerDown", downResponseHandler, true);
                    document.body.addEventListener("MSPointerUp", upResponseHandler, true);
                }
                else
                {
                    document.addEventListener("mousedown", downResponseHandler, true);
                    document.addEventListener("mouseup", upResponseHandler, true);
                }
            }
            else
            {
                // we install the up handler on the document, so that an up
                // event can be detected even on an element different from the
                // target of the preceding down event
                document.addEventListener("mouseup", upResponseHandler, true);
                if (window.PointerEvent) document.addEventListener("pointerup", upResponseHandler, true);
                else if (window.MSPointerEvent) document.addEventListener("MSPointerUp", upResponseHandler, true); // IE10

                for (i = 0; i < tmbUI.UIelements.length; i++)
                {
                    if (window.PointerEvent)
                    {
                        getID(tmbUI.UIelements[i]).addEventListener("pointerdown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).addEventListener("pointerup", upResponseHandler, true);
                    }
                    else if (window.MSPointerEvent) // IE10
                    {
                        getID(tmbUI.UIelements[i]).addEventListener("MSPointerDown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).addEventListener("MSPointerUp", upResponseHandler, true);
                    }
                    else
                    {
                        getID(tmbUI.UIelements[i]).addEventListener("mousedown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).addEventListener("mouseup", upResponseHandler, true);
                    }
                }
            }
        }
        // listen to touch events
        if (tmbUI.UIevents.includes("taps"))
        {
            if (tmbUI.UIelements.length === 0)
            {
                if (window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                {
                    document.addEventListener("pointerdown", downResponseHandler, true);
                    document.addEventListener("pointerup", upResponseHandler, true);
                }
                else if (window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                {
                    document.addEventListener("MSPointerDown", downResponseHandler, true);
                    document.addEventListener("MSPointerUp", upResponseHandler, true);
                }
                else if (hasTouch && !hasPointer)
                {
                    document.addEventListener("touchstart", downResponseHandler, true);
                    document.addEventListener("touchend", upResponseHandler, true);
                }
            }
            else
            {
                if (window.PointerEvent) document.addEventListener("pointerup", upResponseHandler, true);
                else if (window.MSPointerEvent) document.addEventListener("MSPointerUp", upResponseHandler, true);
                if (hasTouch) document.addEventListener("touchend", upResponseHandler, true);

                for (i = 0; i < tmbUI.UIelements.length; i++)
                {
                    if (window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                    {
                        getID(tmbUI.UIelements[i]).addEventListener("pointerdown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).addEventListener("pointerup", upResponseHandler, true);
                    }
                    else if (window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                    {
                        getID(tmbUI.UIelements[i]).addEventListener("MSPointerDown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).addEventListener("MSPointerUp", upResponseHandler, true);
                    }
                    else if (hasTouch && !hasPointer)
                    {
                        getID(tmbUI.UIelements[i]).addEventListener("touchstart", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).addEventListener("touchend", upResponseHandler, true);
                    }
                }
            }
        }
    }

    // removes installed listeners
    function removeHandlers()
    {
        if (tmbUI.UIevents.includes("keys"))
        {
            document.removeEventListener("keydown", downResponseHandler, true);
            document.removeEventListener("keyup", upResponseHandler, true);
        }
        if (tmbUI.UIevents.includes("clicks"))
        {
            if (tmbUI.UIelements.length === 0)
            {
                if (window.PointerEvent)
                {
                    document.body.removeEventListener("pointerdown", downResponseHandler, true);
                    document.body.removeEventListener("pointerup", upResponseHandler, true);
                }
                else if (window.MSPointerEvent) // IE10
                {
                    document.body.removeEventListener("MSPointerDown", downResponseHandler, true);
                    document.body.removeEventListener("MSPointerUp", upResponseHandler, true);
                }
                else
                {
                    document.removeEventListener("mousedown", downResponseHandler, true);
                    document.removeEventListener("mouseup", upResponseHandler, true);
                }
            }
            else
            {
                // remove up handlers on document body
                if (window.PointerEvent) document.removeEventListener("pointerup", upResponseHandler, true);
                else if (window.MSPointerEvent) document.removeEventListener("MSPointerUp", upResponseHandler, true);
                document.removeEventListener("mouseup", upResponseHandler, true);

                for (i = 0; i < tmbUI.UIelements.length; i++)
                {
                    if (window.PointerEvent)
                    {
                        getID(tmbUI.UIelements[i]).removeEventListener("pointerdown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).removeEventListener("pointerup", upResponseHandler, true);
                    }
                    else if (window.MSPointerEvent) // IE10
                    {
                        getID(tmbUI.UIelements[i]).removeEventListener("MSPointerDown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).removeEventListener("MSPointerUp", upResponseHandler, true);
                    }
                    else
                    {
                        getID(tmbUI.UIelements[i]).removeEventListener("mousedown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).removeEventListener("mouseup", upResponseHandler, true);
                    }
                }
            }
        }
        if (tmbUI.UIevents.includes("taps"))
        {
            if (tmbUI.UIelements.length === 0)
            {
                if (window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                {
                    document.removeEventListener("pointerdown", downResponseHandler, true);
                    document.removeEventListener("pointerup", upResponseHandler, true);
                }
                else if (window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                {
                    document.removeEventListener("MSPointerDown", downResponseHandler, true);
                    document.removeEventListener("MSPointerUp", upResponseHandler, true);
                }
                else if (hasTouch && !hasPointer)
                {
                    document.removeEventListener("touchstart", downResponseHandler, true);
                    document.removeEventListener("touchend", upResponseHandler, true);
                }
            }
            else
            {
                if (window.PointerEvent) document.removeEventListener("pointerup", upResponseHandler, true);
                else if (window.MSPointerEvent) document.removeEventListener("MSPointerUp", upResponseHandler, true);
                if (hasTouch) document.removeEventListener("touchend", upResponseHandler, true);

                for (i = 0; i < tmbUI.UIelements.length; i++)
                {
                    if (window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                    {
                        getID(tmbUI.UIelements[i]).removeEventListener("pointerdown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).removeEventListener("pointerup", upResponseHandler, true);
                    }
                    else if (window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                    {
                        getID(tmbUI.UIelements[i]).removeEventListener("MSPointerDown", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).removeEventListener("MSPointerUp", upResponseHandler, true);
                    }
                    else if (hasTouch && !hasPointer)
                    {
                        getID(tmbUI.UIelements[i]).removeEventListener("touchstart", downResponseHandler, true);
                        getID(tmbUI.UIelements[i]).removeEventListener("touchend", upResponseHandler, true);
                    }
                }
            }
        }
    }

    function returnHandler()
    {
        // clear the timeout trap
        if (tmbUI.timeoutRef) clearTimeout(tmbUI.timeoutRef);

        // if we have highlighted something, wait to switch it off
        // then fire readyUI event
        if (highlightEl)
        {
            setTimeout(function ()
            {
                if (['div', 'span', 'button', 'p', 'img'].includes(highlightEl.tagName.toLowerCase()))
                {
                    highlightEl.classList.remove(tmbUI.highlight);
                }
                else if (['circle', 'rect', 'ellipse', 'line',
                    'path', 'polygon', 'polyline', 'image',
                    'text'].includes(highlightEl.tagName.toLowerCase()))
                {
                     highlightEl.classList.remove(tmbUI.highlight);
                }

                // zero timeoutRef, so we can listen to a new response
                tmbUI.timeoutRef = 0;
                
                // fire readyUI event
                var readyUI = new CustomEvent("readyUI");
                document.addEventListener("readyUI", tmbUI.onreadyUI, true);
                document.dispatchEvent(readyUI);
                document.removeEventListener("readyUI", tmbUI.onreadyUI, true);
            }, 250);
        }
        else
        {
            // zero timeoutRef, so we can listen to a new response
            tmbUI.timeoutRef = 0;
            
            var readyUI = new CustomEvent("readyUI");
            document.addEventListener("readyUI", tmbUI.onreadyUI, true);
            document.dispatchEvent(readyUI);
            document.removeEventListener("readyUI", tmbUI.onreadyUI, true);
        }
    }

    // set a timeout trap
    // N.B. we start listening for a new response only when timeoutRef === 0
    tmbUI.timeoutRef = setTimeout(function ()
    {
        tmbUI.status = "timeout";
        tmbUI.message += "Timeout: no response in " + tmbUI.timeout + " ms.";
        removeHandlers();
        returnHandler();
    }, tmbUI.timeout);

    // finally, start listening!
    installHandlers();

    return false;
};

function mb_strwidth(s)
{
    // Returns the length of string 's', taking into account
    // full- and half-width characters, e.g. in Asian and Latin alphabets
    // Equivalent to homonymous PHP function

    var l = 0;
    var chars = Array.from(s);
    for (var char of chars) {
        var c = char.codePointAt(0);
        if (c === undefined) continue;

        if (0x1100 <= c && c <= 0x115F) {
            l += 2;
        } else if (0x11A3 <= c && c <= 0x11A7) {
            l += 2;
        } else if (0x11FA <= c && c <= 0x11FF) {
            l += 2;
        } else if (0x2329 <= c && c <= 0x232A) {
            l += 2;
        } else if (0x2E80 <= c && c <= 0x2E99) {
            l += 2;
        } else if (0x2E9B <= c && c <= 0x2EF3) {
            l += 2;
        } else if (0x2F00 <= c && c <= 0x2FD5) {
            l += 2;
        } else if (0x2FF0 <= c && c <= 0x2FFB) {
            l += 2;
        } else if (0x3000 <= c && c <= 0x303E) {
            l += 2;
        } else if (0x3041 <= c && c <= 0x3096) {
            l += 2;
        } else if (0x3099 <= c && c <= 0x30FF) {
            l += 2;
        } else if (0x3105 <= c && c <= 0x312D) {
            l += 2;
        } else if (0x3131 <= c && c <= 0x318E) {
            l += 2;
        } else if (0x3190 <= c && c <= 0x31BA) {
            l += 2;
        } else if (0x31C0 <= c && c <= 0x31E3) {
            l += 2;
        } else if (0x31F0 <= c && c <= 0x321E) {
            l += 2;
        } else if (0x3220 <= c && c <= 0x3247) {
            l += 2;
        } else if (0x3250 <= c && c <= 0x32FE) {
            l += 2;
        } else if (0x3300 <= c && c <= 0x4DBF) {
            l += 2;
        } else if (0x4E00 <= c && c <= 0xA48C) {
            l += 2;
        } else if (0xA490 <= c && c <= 0xA4C6) {
            l += 2;
        } else if (0xA960 <= c && c <= 0xA97C) {
            l += 2;
        } else if (0xAC00 <= c && c <= 0xD7A3) {
            l += 2;
        } else if (0xD7B0 <= c && c <= 0xD7C6) {
            l += 2;
        } else if (0xD7CB <= c && c <= 0xD7FB) {
            l += 2;
        } else if (0xF900 <= c && c <= 0xFAFF) {
            l += 2;
        } else if (0xFE10 <= c && c <= 0xFE19) {
            l += 2;
        } else if (0xFE30 <= c && c <= 0xFE52) {
            l += 2;
        } else if (0xFE54 <= c && c <= 0xFE66) {
            l += 2;
        } else if (0xFE68 <= c && c <= 0xFE6B) {
            l += 2;
        } else if (0xFF01 <= c && c <= 0xFF60) {
            l += 2;
        } else if (0xFFE0 <= c && c <= 0xFFE6) {
            l += 2;
        } else if (0x1B000 <= c && c <= 0x1B001) {
            l += 2;
        } else if (0x1F200 <= c && c <= 0x1F202) {
            l += 2;
        } else if (0x1F210 <= c && c <= 0x1F23A) {
            l += 2;
        } else if (0x1F240 <= c && c <= 0x1F248) {
            l += 2;
        } else if (0x1F250 <= c && c <= 0x1F251) {
            l += 2;
        } else if (0x20000 <= c && c <= 0x2FFFD) {
            l += 2;
        } else if (0x30000 <= c && c <= 0x3FFFD) {
            l += 2;
        } else {
            l += 1;
        }
    }
    return l;
}

function showAlert(alertMessage, alertButtonText, action, fontSize, timeout,
                   useSpaceBar, hideCursor)
{
    var alertBox, alertContent, alertButton, alertSpaceBar,
        bodyCursorStyle, buttonCursorStyle;

    // save the current body cursor style and set the required one
    bodyCursorStyle = window.getComputedStyle(document.body)["cursor"];
    if(!hideCursor && bodyCursorStyle === 'none') document.body.style.cursor = 'auto';
    else if(hideCursor && bodyCursorStyle !== 'none') document.body.style.cursor = 'none';

    // create the container div if necessary
    if (!(alertBox = getID('alertBox')))
    {
        // set sizes to inherit parent's
        alertBox = document.createElement('div');
        alertBox.id = 'alertBox';
        alertBox.style.margin = 'auto';
        alertBox.style.height = 'inherit';//document.body.clientHeight+'px';
        alertBox.style.width = 'inherit';//document.body.clientWidth+'px';
        alertBox.style.verticalAlign = 'middle';
        alertBox.style.textAlign = 'center';
        document.body.appendChild(alertBox);
    }

    // set the required font size
    if (fontSize) alertBox.style.fontSize = fontSize;

    // create the message span if necessary,
    // then set the message to display
    if (!(alertContent = getID('alertContent')))
    {
        alertContent = document.createElement('span');
        alertContent.id = 'alertContent';
        alertContent.style.margin = 'auto';
        alertContent.style.display = 'inline';
        alertBox.appendChild(alertContent);
    }
    alertContent.innerHTML = alertMessage;

    // create the button if necessary
    if (!(alertButton = getID('alertButton')))
    {
        alertButton = document.createElement('button');
        alertButton.id = 'alertButton';
        alertButton.className = 'button';
        alertButton.style.margin = 'auto';
        alertButton.style.maxWidth = '100%';
        alertButton.style.lineHeight = '1.5em';
        alertButton.style.textAlign = 'center';
        alertButton.style.fontSize = '1.2em';
        alertButton.style.padding = '0 1ch';
        alertButton.style.display = 'inline';
        alertBox.appendChild(alertButton);
    }
    // if args contain button text,
    // show the button and set the required action for it,
    // otherwise hide the button
    if (alertButtonText && !useSpaceBar && !timeout)
    {
        // save the current button cursor style and set the required one
        buttonCursorStyle = window.getComputedStyle(alertButton)["cursor"];
        if(!hideCursor && buttonCursorStyle === 'none') alertButton.style.cursor = 'pointer';
        else if(hideCursor && buttonCursorStyle !== 'none') alertButton.style.cursor = 'none';

        alertButton.innerHTML = alertButtonText;
        alertButton.onclick = function()
        {
            document.body.style.cursor = bodyCursorStyle;
            alertButton.style.cursor = buttonCursorStyle;
            action();
        };
        alertButton.style.display = 'inline';
    }
    else alertButton.style.display = 'none';

    // create the spaceBar span if necessary
    if (!(alertSpaceBar = getID('alertSpaceBar')))
    {
        alertSpaceBar = document.createElement('span');
        alertSpaceBar.id = 'alertSpaceBar';
        alertSpaceBar.style.margin = 'auto';
        alertSpaceBar.style.display = 'inline';
        //alertSpaceBar.style.fontSize = '20px';
        alertBox.appendChild(alertSpaceBar);
    }
    // if args contain 'useSpaceBar',
    // show the spaceBar span and set the required key listener,
    // otherwise hide the span
    if (useSpaceBar && !timeout)
    {
        // alertSpaceBar.style.width = (mb_strwidth(useSpaceBar) + 3) + 'ch';
        alertSpaceBar.innerHTML = useSpaceBar;
        alertSpaceBar.style.display = 'inline';

        function spaceBarHandler(e)
        {
            var key = e.charCode || e.keyCode;
            if (key === 32)
            {
                e.preventDefault();
                e.stopPropagation();
                if(e.type === 'keydown')
                {
                    document.removeEventListener('keydown', spaceBarHandler, true);
                }
                else
                {
                    document.removeEventListener('keyup', spaceBarHandler, true);
                    document.body.style.cursor = bodyCursorStyle;
                    action();
                }
            }
        }

        document.addEventListener('keydown', spaceBarHandler, true);
        document.addEventListener('keyup', spaceBarHandler, true);
    }
    else alertSpaceBar.style.display = 'none';

    // if args contain a timeout,
    // trigger the action automatically when timeout expires
    if (timeout) setTimeout(function()
    {
        document.body.style.cursor = bodyCursorStyle;
        action();
    }, timeout);

    // hide everything else except this
    showFrame(null);
    alertBox.style.display = 'table-cell';
}

function setBodyScale(width, height)
{
    // Fail silently if visualViewport is not supported
    if (!('visualViewport' in window)) return;

    // If the dimensions of the desired bounding box aren't specified,
    // throw an error.
    if (!width || !height)
        throw new TypeError("setBodyScale: dimensions not specified");

    // Check if a viewport meta tag exists: if not, we create one.
    var viewportMeta = document.getElementsByTagName('meta')['viewport'];
    if (!viewportMeta)
    {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = "viewport";
        viewportMeta.id = "viewport";
        document.getElementsByTagName('head')[0].appendChild(viewportMeta);
    }

    // Initialize the viewport to its ideal dimensions, in case it isn't
    viewportMeta.content = "width=device-width, initial-scale=1, viewport-fit=contain";

    // initialize the body
    var bodyStyle = document.body.style;
    bodyStyle.position = 'absolute';
    bodyStyle.width = visualViewport.width + 'px';
    bodyStyle.left = (visualViewport.width / 2) + 'px';
    bodyStyle.marginLeft = (-visualViewport.width / 2) + 'px';
    bodyStyle.height = visualViewport.height + 'px';
    bodyStyle.top = (visualViewport.height / 2) + 'px';
    bodyStyle.marginTop = (-visualViewport.height / 2) + 'px';
    bodyStyle.overflow = 'hidden';

    function bodyScaleHandler()
    {
        // reset the body before resizing
        bodyStyle.width = visualViewport.width + 'px';
        bodyStyle.height = visualViewport.height + 'px';
        bodyStyle.left = (visualViewport.width / 2) + 'px';
        bodyStyle.top = (visualViewport.height / 2) + 'px';
        bodyStyle.marginLeft = (-visualViewport.width / 2) + 'px';
        bodyStyle.marginTop = (-visualViewport.height / 2) + 'px';
        bodyStyle.overflow = 'hidden';
        bodyStyle.transform = 'scale(1)';

        // if the body's width is smaller than the desired size, set it to
        // the desired size and re-center
        if (visualViewport.width < width)
        {
            bodyStyle.width = width + 'px';
            bodyStyle.marginLeft = (-width / 2) + 'px';
        }
        // if the body's height is smaller than the desired size, set it to
        // the desired size and re-center
        if (visualViewport.height < height)
        {
            bodyStyle.height = height + 'px';
            bodyStyle.marginTop = (-height / 2) + 'px';
        }
        // force reflow
        document.body.offsetHeight;

        // if the viewport is smaller than the desired bounding box
        // (vertically, or horizontally or both), compute the necessary
        // scaling and apply to the body
        if (visualViewport.width * visualViewport.scale < width ||
            visualViewport.height * visualViewport.scale < height)
        {
            var widthScale = visualViewport.width * visualViewport.scale / width;
            var heightScale = visualViewport.height * visualViewport.scale / height;

            var scale = Math.min(widthScale, heightScale);
            bodyStyle.transform = 'scale(' + scale + ')';
        }
        document.body.offsetHeight;

        // recenter by adding viewport offset
        bodyStyle.left = (parseFloat(bodyStyle.left) + visualViewport.pageLeft) + 'px';
        bodyStyle.top = (parseFloat(bodyStyle.top) + visualViewport.pageTop) + 'px';
        document.body.offsetHeight;
    }

    // We attach listeners for the resize event to the window and
    // to the viewport
    // (orientationchange is added for browsers that don't fire a resize
    // event on orientation change)
    // the resize handler is debounced, so multiple (near-)simultaneous
    // events only trigger it once
    var resizeHandler = debounce(bodyScaleHandler, 1000);
    window.addEventListener('resize', resizeHandler);
    visualViewport.addEventListener('resize', resizeHandler);
    if ('orientation' in screen)
        screen.orientation.addEventListener("change", resizeHandler);
    else if ('onorientationchange' in window)
        window.addEventListener("orientationchange", resizeHandler);

    // on first call, set the desired scale
    bodyScaleHandler();
}

function deviceScan()
{
    var scan = {}, userAgent;

    userAgent = navigator.userAgent || navigator.vendor || window.opera;
    scan.screenW = screen.width > screen.height ?
        screen.width : screen.height;
    scan.screenH = screen.width < screen.height ?
        screen.width : screen.height;
    scan.touch = ("ontouchend" in window ||
                  ("maxTouchPoints" in navigator &&
                   navigator.maxTouchPoints > 0) ||
                  ("msMaxTouchPoints" in navigator &&
                   navigator.msMaxTouchPoints > 0) ||
                  (window.matchMedia &&
                   window.matchMedia("(any-pointer: coarse)").matches) ||
                  false);
    scan.OS = /windows phone/i.test(userAgent) ?
        "WindowsPhone" :
            /Kindle Fire|Silk|KFAPWA|KFSOWI|KFJWA|KFJWI|KFAPWI|KFOT|KFTT|KFTHWI|KFTHWA|KFASWI|KFTBWI|KFMEWI|KFFOWI|KFSAWA|KFSAWI|KFARWI/i.test(userAgent) ?
        "KindleFire" :
            /BlackBerry|BB10|PlayBook/i.test(userAgent) ?
        "BlackBerry" :
            /MeeGO/i.test(userAgent) ?
        "MeeGO" :
            /Bada/i.test(userAgent) ?
        "Bada" :
            /Tizen/i.test(userAgent) ?
        "Tizen" :
            /android/i.test(userAgent) ?
        "Android" :
            /iPad|iPhone|iPod/i.test(userAgent) && !window.MSStream ?
        "iOS" :
            /Win/i.test(userAgent) ?
        "Windows" :
            /Mac/i.test(userAgent) ?
        "MacOS" :
            /Linux|X11/i.test(userAgent) ?
        "Unix" :
        "unknown";
    scan.UTCoffset = new Date().getTimezoneOffset();

    return (scan);
}

function parseQuery(queryStr)
{
    var query = {};
    var pairs = (queryStr[0] === '?' ? queryStr.substring(1) : queryStr).split('&');
    if (pairs[0] !== '')
    {
        for (var i = 0; i < pairs.length; i++)
        {
            var pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
    }
    return query;
}

