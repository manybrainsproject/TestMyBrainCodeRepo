/*
 Copyright 2024 by the Many Brains Project, Inc.
 ===============================================

 This code is made available under a GNU Lesser General Public License 3.0
 (LGPLv3).
 https://www.gnu.org/licenses/lgpl-3.0.html.

 The following third party libraries and code are included in TestMyBrain.js
 for convenience (copyright and licenses, where applicable, are by their
 respective authors and can be found in the code or in the attached web
 links):

 - rawdeflate.js at
 https://github.com/dankogai/js-deflate
 - rawinflate.js at
 https://github.com/dankogai/js-deflate
 - json2.js at
 https://github.com/douglascrockford/JSON-js
 - FileSaver.js at
 https://github.com/ChenWenBrian/FileSaver.js
 - Blob.js at
 https://github.com/eligrey/Blob.js
 - seedrandom.js at
 https://github.com/davidbau/seedrandom/tree/master
 - setImmediate.js at
 https://github.com/YuzuJS/setImmediate
 - requestAnimationFrame and cancelAnimationFrame at
 https://github.com/darius/requestAnimationFrame
 - atob and btoa at
 https://github.com/davidchambers/Base64.js
 - Object.create at
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 - Object.keys at
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 - Function.prototype.bind at
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 - Array.isArray at
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
 - all standard HTML5 array prototype methods at
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

 */
 
 if (!Date.now) Date.now = function() { return new Date().getTime(); };

// polyfill of requestAnimationFrame
//https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
(function() {
    'use strict';

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
        || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var RAFnow = Date.now();
            var nextTime = Math.max(lastTime + 16, RAFnow);
            return setTimeout(function() { callback(lastTime = nextTime); },
                nextTime - RAFnow);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

// polyfill of btoa and atob (base64 encode/decode)
// https://github.com/davidchambers/Base64.js
(function () {
    var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
        this.message = message;
    }
    InvalidCharacterError.prototype = new Error;
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (
        object.btoa = function (input) {
            var str = String(input);
            for (
                // initialize result and counter
                var block, charCode, idx = 0, map = chars, output = '';
                // if the next str index does not exist:
                //   change the mapping table to "="
                //   check if d has no fractional digits
                str.charAt(idx | 0) || (map = '=', idx % 1);
                // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
                output += map.charAt(63 & block >> 8 - idx % 1 * 8)
            ) {
                charCode = str.charCodeAt(idx += 3/4);
                if (charCode > 0xFF) {
                    throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                }
                block = block << 8 | charCode;
            }
            return output;
        });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (
        object.atob = function (input) {
            var str = String(input).replace(/=+$/, '');
            if (str.length % 4 == 1) {
                throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = str.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
                // try to find character in table (0-63, not found => -1)
                buffer = chars.indexOf(buffer);
            }
            return output;
        });

}());

var base64decode = atob; // alias compatible with zen.js
var base64encode = btoa; // alias compatible with zen.js

// polyfill of document.getElementsByClassName
if(!document.getElementsByClassName)
{
    document.getElementsByClassName = function (searchClass)
    {
        var classElements = [];
        var node = document;
        var els = node.getElementsByTagName('*');
        var elsLen = els.length;
        var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");

        for (var i = 0, j = 0; i < elsLen; i++)
        {
            if (pattern.test(els[i].className))
            {
                classElements[j] = els[i];
                j++;
            }
        }
        return classElements;
    };
}

// polyfill of Object.prototype.hasOwnProperty
if (!Object.prototype.hasOwnProperty)
{
    Object.prototype.hasOwnProperty = function(prop)
    {
        var proto = this.__proto__ || this.constructor.prototype;
        return (prop in this) &&
            (!(prop in proto) || proto[prop] !== this[prop]);
    }
}

// polyfill of Object.create
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (typeof Object.create != 'function') {
    Object.create = (function() {
        var Temp = function() {};
        return function (prototype) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (typeof prototype != 'object') {
                throw TypeError('Argument must be an object');
            }
            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;
            return result;
        };
    })();
}

// polyfill of Object.keys
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        }
    })()
};

// polyfill of Function.prototype.bind
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// polyfill of Array.isArray
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

// polyfill of Array.prototype.indexOf
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        if (this === undefined || this === null) {
            throw new TypeError('"this" is null or not defined');
        }

        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }

        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }

        for (; fromIndex < length; fromIndex++) {
            if (this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }

        return -1;
    };
}

// polyfill of Array.prototype.lastIndexOf
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
        'use strict';

        if (this == null) {
            throw new TypeError();
        }

        var n, k,
            t = Object(this),
            len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }

        n = len;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) {
                n = 0;
            }
            else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }

        for (k = n >= 0
            ? Math.min(n, len - 1)
            : len - Math.abs(n); k >= 0; k--) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

// polyfill of Array.prototype.every
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every)
{
    Array.prototype.every = function(fun /*, thisArg */)
    {
        'use strict';

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
            if (i in t && !fun.call(thisArg, t[i], i, t))
                return false;
        }

        return true;
    };
}

// polyfill of Array.prototype.some
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some)
{
    Array.prototype.some = function(fun /*, thisArg */)
    {
        'use strict';

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
            if (i in t && fun.call(thisArg, t[i], i, t))
                return true;
        }

        return false;
    };
}

// polyfill of Array.prototype.forEach
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach)
{
    Array.prototype.forEach = function(fun /*, thisArg */)
    {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
            if (i in t)
                fun.call(thisArg, t[i], i, t);
        }
    };
}

// polyfill of Array.prototype.map
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
if (!Array.prototype.map)
{
    Array.prototype.map = function(fun /*, thisArg */)
    {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = new Array(len);
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
            if (i in t)
                res[i] = fun.call(thisArg, t[i], i, t);
        }

        return res;
    };
}

// polyfill of Array.prototype.filter
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter)
{
    Array.prototype.filter = function(fun /*, thisArg */)
    {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
            if (i in t)
            {
                var val = t[i];

                if (fun.call(thisArg, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}

// polyfill of Array.prototype.reduce
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
if ('function' !== typeof Array.prototype.reduce) {
    Array.prototype.reduce = function(callback, opt_initialValue){
        'use strict';
        if (null === this || 'undefined' === typeof this) {
            throw new TypeError(
                'Array.prototype.reduce called on null or undefined');
        }
        if ('function' !== typeof callback) {
            throw new TypeError(callback + ' is not a function');
        }
        var index, value,
            length = this.length >>> 0,
            isValueSet = false;
        if (1 < arguments.length) {
            value = opt_initialValue;
            isValueSet = true;
        }
        for (index = 0; length > index; ++index) {
            if (this.hasOwnProperty(index)) {
                if (isValueSet) {
                    value = callback(value, this[index], index, this);
                }
                else {
                    value = this[index];
                    isValueSet = true;
                }
            }
        }
        if (!isValueSet) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        return value;
    };
}

// polyfill of Array.prototype.reduceRight
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight
if ('function' !== typeof Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(callback, opt_initialValue) {
        'use strict';
        if (null === this || 'undefined' === typeof this) {
            throw new TypeError(
                'Array.prototype.reduceRight called on null or undefined');
        }
        if ('function' !== typeof callback) {
            throw new TypeError(callback + ' is not a function');
        }
        var index, value,
            length = this.length >>> 0,
            isValueSet = false;
        if (1 < arguments.length) {
            value = opt_initialValue;
            isValueSet = true;
        }
        for (index = length - 1; -1 < index; --index) {
            if (this.hasOwnProperty(index)) {
                if (isValueSet) {
                    value = callback(value, this[index], index, this);
                }
                else {
                    value = this[index];
                    isValueSet = true;
                }
            }
        }
        if (!isValueSet) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        return value;
    };
}

// polyfill of Array.prototype.slice
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
/*
 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
 * (technically, since host objects have been implementation-dependent,
 * at least before ES6, IE hasn't needed to work this way).
 * Also works on strings, fixes IE < 9 to allow an explicit undefined
 * for the 2nd argument (as in Firefox), and prevents errors when
 * called on other DOM objects.
 */
;(function () {
    'use strict';
    var _slice = Array.prototype.slice;

    try {
        // Can't be used with DOM elements in IE < 9
        _slice.call(document.documentElement);
    } catch (e) { // Fails in IE < 9
        // This will work for genuine arrays, array-like objects,
        // NamedNodeMap (attributes, entities, notations),
        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
        Array.prototype.slice = function(begin, end) {
            // IE < 9 gets unhappy with an undefined end argument
            end = (typeof end !== 'undefined') ? end : this.length;

            // For native Array objects, we use the native slice function
            if (Object.prototype.toString.call(this) === '[object Array]'){
                return _slice.call(this, begin, end);
            }

            // For array like object we handle it ourselves.
            var i, cloned = [],
                size, len = this.length;

            // Handle negative value for "begin"
            var start = begin || 0;
            start = (start >= 0) ? start: len + start;

            // Handle negative value for "end"
            var upTo = (end) ? end : len;
            if (end < 0) {
                upTo = len + end;
            }

            // Actual expected size of the slice
            size = upTo - start;

            if (size > 0) {
                cloned = new Array(size);
                if (this.charAt) {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this[start + i];
                    }
                }
            }

            return cloned;
        };
    }
}());

// polyfill of preventDefault, stopPropagation, addEventListener,
// removeEventListener, stopImmediatePropagation, dispatchEvent, CustomEvent
// https://github.com/jonathantneal/EventListener

this.Element && Element.prototype.attachEvent && !Element.prototype.addEventListener && (function () {
    function addToPrototype(name, method) {
        Window.prototype[name] = HTMLDocument.prototype[name] = Element.prototype[name] = method;
    }

    // add
    addToPrototype("addEventListener", function (type, listener) {
        var
            target = this,
            listeners = target._c1_listeners = target._c1_listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        // if no events exist, attach the listener
        if (!typeListeners.length) {
            target.attachEvent("on" + type, typeListeners.event = function (event) {
                var documentElement = target.document && target.document.documentElement || target.documentElement || { scrollLeft: 0, scrollTop: 0 };

                // polyfill w3c properties and methods
                event.currentTarget = target;
                event.pageX = event.clientX + documentElement.scrollLeft;
                event.pageY = event.clientY + documentElement.scrollTop;
                event.preventDefault = function () { event.returnValue = false };
                event.relatedTarget = event.fromElement || null;
                event.stopImmediatePropagation = function () { immediatePropagation = false; event.cancelBubble = true };
                event.stopPropagation = function () { event.cancelBubble = true };
                event.target = event.srcElement || target;
                event.timeStamp = +new Date;

                // clone the event object to avoid 'Member not found' errors in IE when
                // referencing events outside of callbacks
                var plainEvt = {};
                for (var j in event) {
                    plainEvt[j] = event[j];
                }

                // create an cached list of the master events list (to protect this loop from breaking when an event is removed)
                for (var i = 0, typeListenersCache = [].concat(typeListeners), typeListenerCache, immediatePropagation = true; immediatePropagation && (typeListenerCache = typeListenersCache[i]); ++i) {
                    // check to see if the cached event still exists in the master events list
                    for (var ii = 0, typeListener; typeListener = typeListeners[ii]; ++ii) {
                        if (typeListener == typeListenerCache) {
                            typeListener.call(target,plainEvt);

                            break;
                        }
                    }
                }
            });
        }

        // add the event to the master event list
        typeListeners.push(listener);
    });

    // remove
    addToPrototype("removeEventListener", function (type, listener) {
        var
            target = this,
            listeners = target._c1_listeners = target._c1_listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        // remove the newest matching event from the master event list
        for (var i = typeListeners.length - 1, typeListener; typeListener = typeListeners[i]; --i) {
            if (typeListener == listener) {
                typeListeners.splice(i, 1);

                break;
            }
        }

        // if no events exist, detach the listener
        if (!typeListeners.length && typeListeners.event) {
            target.detachEvent("on" + type, typeListeners.event);
        }
    });

    // dispatch
    addToPrototype("dispatchEvent", function (eventObject) {
        var
            target = this,
            type = eventObject.type,
            listeners = target._c1_listeners = target._c1_listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        try {
            return target.fireEvent("on" + type, eventObject);
        } catch (error) {
            if (typeListeners.event) {
                typeListeners.event(eventObject);
            }

            return;
        }
    });

    // CustomEvent
    try {
        new window.CustomEvent('?');
    } catch (e) {
        Object.defineProperty(Window.prototype, "CustomEvent", {
            get: function () {
                    var self = this;

                    return function CustomEvent(type, detail) {
                        detail = detail || {};
                        var event = self.document.createEventObject(), key;

                        event.type = type;
                        event.returnValue = !detail.cancelable;
                        event.cancelBubble = !detail.bubbles;

                        for (key in detail) {
                            event[key] = detail[key];
                        }
                        return event;
                    };
            }
        })
    };

    // ready
    function ready(event) {
        if (ready.interval && document.body) {
            ready.interval = clearInterval(ready.interval);

            document.dispatchEvent(new CustomEvent("DOMContentLoaded"));
        }
    }

    ready.interval = setInterval(ready, 1);

    window.addEventListener("load", ready);
})();

try {
    new window.CustomEvent('?');
} catch (e) {
    (function() {
        // CustomEvent for browsers which don't natively support the Constructor method
        window.CustomEvent = function CustomEvent(type, eventInitDict) {
            var event;
            eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: undefined};

            try {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
            } catch (error) {
                // for browsers which don't support CustomEvent at all, we use a regular event instead
                event = document.createEvent('Event');
                event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
                event.detail = eventInitDict.detail;
            }

            return event;
        };
    })();
}

// polyfill of Element.remove
if (!('remove' in Element.prototype))
{
    Element.prototype.remove = function()
    {
        if (this.parentNode)
        {
            this.parentNode.removeChild(this);
        }
    };
}

// polyfill of Node constants
if ( !window.Node )
{
    window.Node =
    {
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE: 6,
        PROCESSING_INSTRUCTION_NODE: 7,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9,
        DOCUMENT_TYPE_NODE: 10,
        DOCUMENT_FRAGMENT_NODE: 11,
        NOTATION_NODE: 12
    };
}

// polyfill of Number.isInteger
if(typeof Number.isInteger !== 'function')
{
    Number.isInteger = function(value)
    {
        return typeof value === "number" &&
               isFinite(value) &&
               Math.floor(value) === value;
    };
}

// polyfill of String.trim
if (!String.prototype.trim)
{
    String.prototype.trim = function ()
    {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

//***** rawdeflate.js ver. 0.5 2013/04/09 **************************************
//***** https://github.com/dankogai/js-deflate *********************************
(function(ctx){
    /*
     * $Id: rawdeflate.js,v 0.5 2013/04/09 14:25:38 dankogai Exp dankogai $
     *
     * GNU General Public License, version 2 (GPL-2.0)
     *   http://opensource.org/licenses/GPL-2.0
     * Original:
     *   http://www.onicos.com/staff/iz/amuse/javascript/expert/deflate.txt
     */

    /* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0.1
     * LastModified: Dec 25 1999
     */

    /* Interface:
     * data = zip_deflate(src);
     */

    /* constant parameters */
    var zip_WSIZE = 32768;		// Sliding Window size
    var zip_STORED_BLOCK = 0;
    var zip_STATIC_TREES = 1;
    var zip_DYN_TREES    = 2;

    /* for deflate */
    var zip_DEFAULT_LEVEL = 6;
    var zip_FULL_SEARCH = true;
    var zip_INBUFSIZ = 32768;	// Input buffer size
    var zip_INBUF_EXTRA = 64;	// Extra buffer
    var zip_OUTBUFSIZ = 1024 * 8;
    var zip_window_size = 2 * zip_WSIZE;
    var zip_MIN_MATCH = 3;
    var zip_MAX_MATCH = 258;
    var zip_BITS = 16;
// for SMALL_MEM
    var zip_LIT_BUFSIZE = 0x2000;
    var zip_HASH_BITS = 13;
// for MEDIUM_MEM
// var zip_LIT_BUFSIZE = 0x4000;
// var zip_HASH_BITS = 14;
// for BIG_MEM
// var zip_LIT_BUFSIZE = 0x8000;
// var zip_HASH_BITS = 15;
    if(zip_LIT_BUFSIZE > zip_INBUFSIZ)
        alert("error: zip_INBUFSIZ is too small");
    if((zip_WSIZE<<1) > (1<<zip_BITS))
        alert("error: zip_WSIZE is too large");
    if(zip_HASH_BITS > zip_BITS-1)
        alert("error: zip_HASH_BITS is too large");
    if(zip_HASH_BITS < 8 || zip_MAX_MATCH != 258)
        alert("error: Code too clever");
    var zip_DIST_BUFSIZE = zip_LIT_BUFSIZE;
    var zip_HASH_SIZE = 1 << zip_HASH_BITS;
    var zip_HASH_MASK = zip_HASH_SIZE - 1;
    var zip_WMASK = zip_WSIZE - 1;
    var zip_NIL = 0; // Tail of hash chains
    var zip_TOO_FAR = 4096;
    var zip_MIN_LOOKAHEAD = zip_MAX_MATCH + zip_MIN_MATCH + 1;
    var zip_MAX_DIST = zip_WSIZE - zip_MIN_LOOKAHEAD;
    var zip_SMALLEST = 1;
    var zip_MAX_BITS = 15;
    var zip_MAX_BL_BITS = 7;
    var zip_LENGTH_CODES = 29;
    var zip_LITERALS =256;
    var zip_END_BLOCK = 256;
    var zip_L_CODES = zip_LITERALS + 1 + zip_LENGTH_CODES;
    var zip_D_CODES = 30;
    var zip_BL_CODES = 19;
    var zip_REP_3_6 = 16;
    var zip_REPZ_3_10 = 17;
    var zip_REPZ_11_138 = 18;
    var zip_HEAP_SIZE = 2 * zip_L_CODES + 1;
    var zip_H_SHIFT = parseInt((zip_HASH_BITS + zip_MIN_MATCH - 1) /
    zip_MIN_MATCH);

    /* variables */
    var zip_free_queue;
    var zip_qhead, zip_qtail;
    var zip_initflag;
    var zip_outbuf = null;
    var zip_outcnt, zip_outoff;
    var zip_complete;
    var zip_window;
    var zip_d_buf;
    var zip_l_buf;
    var zip_prev;
    var zip_bi_buf;
    var zip_bi_valid;
    var zip_block_start;
    var zip_ins_h;
    var zip_hash_head;
    var zip_prev_match;
    var zip_match_available;
    var zip_match_length;
    var zip_prev_length;
    var zip_strstart;
    var zip_match_start;
    var zip_eofile;
    var zip_lookahead;
    var zip_max_chain_length;
    var zip_max_lazy_match;
    var zip_compr_level;
    var zip_good_match;
    var zip_nice_match;
    var zip_dyn_ltree;
    var zip_dyn_dtree;
    var zip_static_ltree;
    var zip_static_dtree;
    var zip_bl_tree;
    var zip_l_desc;
    var zip_d_desc;
    var zip_bl_desc;
    var zip_bl_count;
    var zip_heap;
    var zip_heap_len;
    var zip_heap_max;
    var zip_depth;
    var zip_length_code;
    var zip_dist_code;
    var zip_base_length;
    var zip_base_dist;
    var zip_flag_buf;
    var zip_last_lit;
    var zip_last_dist;
    var zip_last_flags;
    var zip_flags;
    var zip_flag_bit;
    var zip_opt_len;
    var zip_static_len;
    var zip_deflate_data;
    var zip_deflate_pos;

    /* objects (deflate) */

    var zip_DeflateCT = function() {
        this.fc = 0; // frequency count or bit string
        this.dl = 0; // father node in Huffman tree or length of bit string
    }

    var zip_DeflateTreeDesc = function() {
        this.dyn_tree = null;	// the dynamic tree
        this.static_tree = null;	// corresponding static tree or NULL
        this.extra_bits = null;	// extra bits for each code or NULL
        this.extra_base = 0;	// base index for extra_bits
        this.elems = 0;		// max number of elements in the tree
        this.max_length = 0;	// max bit length for the codes
        this.max_code = 0;		// largest code with non zero frequency
    }

    /* Values for max_lazy_match, good_match and max_chain_length, depending on
     * the desired pack level (0..9). The values given below have been tuned to
     * exclude worst case performance for pathological files. Better values may be
     * found for specific files.
     */
    var zip_DeflateConfiguration = function(a, b, c, d) {
        this.good_length = a; // reduce lazy search above this match length
        this.max_lazy = b;    // do not perform lazy search above this match length
        this.nice_length = c; // quit search above this match length
        this.max_chain = d;
    }

    var zip_DeflateBuffer = function() {
        this.next = null;
        this.len = 0;
        this.ptr = new Array(zip_OUTBUFSIZ);
        this.off = 0;
    }

    /* constant tables */
    var zip_extra_lbits = new Array(
        0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0);
    var zip_extra_dbits = new Array(
        0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13);
    var zip_extra_blbits = new Array(
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7);
    var zip_bl_order = new Array(
        16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15);
    var zip_configuration_table = new Array(
        new zip_DeflateConfiguration(0,    0,   0,    0),
        new zip_DeflateConfiguration(4,    4,   8,    4),
        new zip_DeflateConfiguration(4,    5,  16,    8),
        new zip_DeflateConfiguration(4,    6,  32,   32),
        new zip_DeflateConfiguration(4,    4,  16,   16),
        new zip_DeflateConfiguration(8,   16,  32,   32),
        new zip_DeflateConfiguration(8,   16, 128,  128),
        new zip_DeflateConfiguration(8,   32, 128,  256),
        new zip_DeflateConfiguration(32, 128, 258, 1024),
        new zip_DeflateConfiguration(32, 258, 258, 4096));


    /* routines (deflate) */

    var zip_deflate_start = function(level) {
        var i;

        if(!level)
            level = zip_DEFAULT_LEVEL;
        else if(level < 1)
            level = 1;
        else if(level > 9)
            level = 9;

        zip_compr_level = level;
        zip_initflag = false;
        zip_eofile = false;
        if(zip_outbuf != null)
            return;

        zip_free_queue = zip_qhead = zip_qtail = null;
        zip_outbuf = new Array(zip_OUTBUFSIZ);
        zip_window = new Array(zip_window_size);
        zip_d_buf = new Array(zip_DIST_BUFSIZE);
        zip_l_buf = new Array(zip_INBUFSIZ + zip_INBUF_EXTRA);
        zip_prev = new Array(1 << zip_BITS);
        zip_dyn_ltree = new Array(zip_HEAP_SIZE);
        for(i = 0; i < zip_HEAP_SIZE; i++)
            zip_dyn_ltree[i] = new zip_DeflateCT();
        zip_dyn_dtree = new Array(2*zip_D_CODES+1);
        for(i = 0; i < 2*zip_D_CODES+1; i++)
            zip_dyn_dtree[i] = new zip_DeflateCT();
        zip_static_ltree = new Array(zip_L_CODES+2);
        for(i = 0; i < zip_L_CODES+2; i++)
            zip_static_ltree[i] = new zip_DeflateCT();
        zip_static_dtree = new Array(zip_D_CODES);
        for(i = 0; i < zip_D_CODES; i++)
            zip_static_dtree[i] = new zip_DeflateCT();
        zip_bl_tree = new Array(2*zip_BL_CODES+1);
        for(i = 0; i < 2*zip_BL_CODES+1; i++)
            zip_bl_tree[i] = new zip_DeflateCT();
        zip_l_desc = new zip_DeflateTreeDesc();
        zip_d_desc = new zip_DeflateTreeDesc();
        zip_bl_desc = new zip_DeflateTreeDesc();
        zip_bl_count = new Array(zip_MAX_BITS+1);
        zip_heap = new Array(2*zip_L_CODES+1);
        zip_depth = new Array(2*zip_L_CODES+1);
        zip_length_code = new Array(zip_MAX_MATCH-zip_MIN_MATCH+1);
        zip_dist_code = new Array(512);
        zip_base_length = new Array(zip_LENGTH_CODES);
        zip_base_dist = new Array(zip_D_CODES);
        zip_flag_buf = new Array(parseInt(zip_LIT_BUFSIZE / 8));
    }

    var zip_deflate_end = function() {
        zip_free_queue = zip_qhead = zip_qtail = null;
        zip_outbuf = null;
        zip_window = null;
        zip_d_buf = null;
        zip_l_buf = null;
        zip_prev = null;
        zip_dyn_ltree = null;
        zip_dyn_dtree = null;
        zip_static_ltree = null;
        zip_static_dtree = null;
        zip_bl_tree = null;
        zip_l_desc = null;
        zip_d_desc = null;
        zip_bl_desc = null;
        zip_bl_count = null;
        zip_heap = null;
        zip_depth = null;
        zip_length_code = null;
        zip_dist_code = null;
        zip_base_length = null;
        zip_base_dist = null;
        zip_flag_buf = null;
    }

    var zip_reuse_queue = function(p) {
        p.next = zip_free_queue;
        zip_free_queue = p;
    }

    var zip_new_queue = function() {
        var p;

        if(zip_free_queue != null)
        {
            p = zip_free_queue;
            zip_free_queue = zip_free_queue.next;
        }
        else
            p = new zip_DeflateBuffer();
        p.next = null;
        p.len = p.off = 0;

        return p;
    }

    var zip_head1 = function(i) {
        return zip_prev[zip_WSIZE + i];
    }

    var zip_head2 = function(i, val) {
        return zip_prev[zip_WSIZE + i] = val;
    }

    /* put_byte is used for the compressed output, put_ubyte for the
     * uncompressed output. However unlzw() uses window for its
     * suffix table instead of its output buffer, so it does not use put_ubyte
     * (to be cleaned up).
     */
    var zip_put_byte = function(c) {
        zip_outbuf[zip_outoff + zip_outcnt++] = c;
        if(zip_outoff + zip_outcnt == zip_OUTBUFSIZ)
            zip_qoutbuf();
    }

    /* Output a 16 bit value, lsb first */
    var zip_put_short = function(w) {
        w &= 0xffff;
        if(zip_outoff + zip_outcnt < zip_OUTBUFSIZ - 2) {
            zip_outbuf[zip_outoff + zip_outcnt++] = (w & 0xff);
            zip_outbuf[zip_outoff + zip_outcnt++] = (w >>> 8);
        } else {
            zip_put_byte(w & 0xff);
            zip_put_byte(w >>> 8);
        }
    }

    /* ==========================================================================
     * Insert string s in the dictionary and set match_head to the previous head
     * of the hash chain (the most recent string with same hash key). Return
     * the previous length of the hash chain.
     * IN  assertion: all calls to to INSERT_STRING are made with consecutive
     *    input characters and the first MIN_MATCH bytes of s are valid
     *    (except for the last MIN_MATCH-1 bytes of the input file).
     */
    var zip_INSERT_STRING = function() {
        zip_ins_h = ((zip_ins_h << zip_H_SHIFT)
        ^ (zip_window[zip_strstart + zip_MIN_MATCH - 1] & 0xff))
        & zip_HASH_MASK;
        zip_hash_head = zip_head1(zip_ins_h);
        zip_prev[zip_strstart & zip_WMASK] = zip_hash_head;
        zip_head2(zip_ins_h, zip_strstart);
    }

    /* Send a code of the given tree. c and tree must not have side effects */
    var zip_SEND_CODE = function(c, tree) {
        zip_send_bits(tree[c].fc, tree[c].dl);
    }

    /* Mapping from a distance to a distance code. dist is the distance - 1 and
     * must not have side effects. dist_code[256] and dist_code[257] are never
     * used.
     */
    var zip_D_CODE = function(dist) {
        return (dist < 256 ? zip_dist_code[dist]
                : zip_dist_code[256 + (dist>>7)]) & 0xff;
    }

    /* ==========================================================================
     * Compares to subtrees, using the tree depth as tie breaker when
     * the subtrees have equal frequency. This minimizes the worst case length.
     */
    var zip_SMALLER = function(tree, n, m) {
        return tree[n].fc < tree[m].fc ||
            (tree[n].fc == tree[m].fc && zip_depth[n] <= zip_depth[m]);
    }

    /* ==========================================================================
     * read string data
     */
    var zip_read_buff = function(buff, offset, n) {
        var i;
        for(i = 0; i < n && zip_deflate_pos < zip_deflate_data.length; i++)
            buff[offset + i] =
                zip_deflate_data.charCodeAt(zip_deflate_pos++) & 0xff;
        return i;
    }

    /* ==========================================================================
     * Initialize the "longest match" routines for a new file
     */
    var zip_lm_init = function() {
        var j;

        /* Initialize the hash table. */
        for(j = 0; j < zip_HASH_SIZE; j++)
//	zip_head2(j, zip_NIL);
            zip_prev[zip_WSIZE + j] = 0;
        /* prev will be initialized on the fly */

        /* Set the default configuration parameters:
         */
        zip_max_lazy_match = zip_configuration_table[zip_compr_level].max_lazy;
        zip_good_match     = zip_configuration_table[zip_compr_level].good_length;
        if(!zip_FULL_SEARCH)
            zip_nice_match = zip_configuration_table[zip_compr_level].nice_length;
        zip_max_chain_length = zip_configuration_table[zip_compr_level].max_chain;

        zip_strstart = 0;
        zip_block_start = 0;

        zip_lookahead = zip_read_buff(zip_window, 0, 2 * zip_WSIZE);
        if(zip_lookahead <= 0) {
            zip_eofile = true;
            zip_lookahead = 0;
            return;
        }
        zip_eofile = false;
        /* Make sure that we always have enough lookahead. This is important
         * if input comes from a device such as a tty.
         */
        while(zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile)
            zip_fill_window();

        /* If lookahead < MIN_MATCH, ins_h is garbage, but this is
         * not important since only literal bytes will be emitted.
         */
        zip_ins_h = 0;
        for(j = 0; j < zip_MIN_MATCH - 1; j++) {
//      UPDATE_HASH(ins_h, window[j]);
            zip_ins_h = ((zip_ins_h << zip_H_SHIFT) ^ (zip_window[j] & 0xff)) & zip_HASH_MASK;
        }
    }

    /* ==========================================================================
     * Set match_start to the longest match starting at the given string and
     * return its length. Matches shorter or equal to prev_length are discarded,
     * in which case the result is equal to prev_length and match_start is
     * garbage.
     * IN assertions: cur_match is the head of the hash chain for the current
     *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
     */
    var zip_longest_match = function(cur_match) {
        var chain_length = zip_max_chain_length; // max hash chain length
        var scanp = zip_strstart; // current string
        var matchp;		// matched string
        var len;		// length of current match
        var best_len = zip_prev_length;	// best match length so far

        /* Stop when cur_match becomes <= limit. To simplify the code,
         * we prevent matches with the string of window index 0.
         */
        var limit = (zip_strstart > zip_MAX_DIST ? zip_strstart - zip_MAX_DIST : zip_NIL);

        var strendp = zip_strstart + zip_MAX_MATCH;
        var scan_end1 = zip_window[scanp + best_len - 1];
        var scan_end  = zip_window[scanp + best_len];

        /* Do not waste too much time if we already have a good match: */
        if(zip_prev_length >= zip_good_match)
            chain_length >>= 2;

//  Assert(encoder->strstart <= window_size-MIN_LOOKAHEAD, "insufficient lookahead");

        do {
//    Assert(cur_match < encoder->strstart, "no future");
            matchp = cur_match;

            /* Skip to next match if the match length cannot increase
             * or if the match length is less than 2:
             */
            if(zip_window[matchp + best_len]	!= scan_end  ||
                zip_window[matchp + best_len - 1]	!= scan_end1 ||
                zip_window[matchp]			!= zip_window[scanp] ||
                zip_window[++matchp]			!= zip_window[scanp + 1]) {
                continue;
            }

            /* The check at best_len-1 can be removed because it will be made
             * again later. (This heuristic is not always a win.)
             * It is not necessary to compare scan[2] and match[2] since they
             * are always equal when the other bytes match, given that
             * the hash keys are equal and that HASH_BITS >= 8.
             */
            scanp += 2;
            matchp++;

            /* We check for insufficient lookahead only every 8th comparison;
             * the 256th check will be made at strstart+258.
             */
            do {
            } while(zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            zip_window[++scanp] == zip_window[++matchp] &&
            scanp < strendp);

            len = zip_MAX_MATCH - (strendp - scanp);
            scanp = strendp - zip_MAX_MATCH;

            if(len > best_len) {
                zip_match_start = cur_match;
                best_len = len;
                if(zip_FULL_SEARCH) {
                    if(len >= zip_MAX_MATCH) break;
                } else {
                    if(len >= zip_nice_match) break;
                }

                scan_end1  = zip_window[scanp + best_len-1];
                scan_end   = zip_window[scanp + best_len];
            }
        } while((cur_match = zip_prev[cur_match & zip_WMASK]) > limit
        && --chain_length != 0);

        return best_len;
    }

    /* ==========================================================================
     * Fill the window when the lookahead becomes insufficient.
     * Updates strstart and lookahead, and sets eofile if end of input file.
     * IN assertion: lookahead < MIN_LOOKAHEAD && strstart + lookahead > 0
     * OUT assertions: at least one byte has been read, or eofile is set;
     *    file reads are performed for at least two bytes (required for the
     *    translate_eol option).
     */
    var zip_fill_window = function() {
        var n, m;

        // Amount of free space at the end of the window.
        var more = zip_window_size - zip_lookahead - zip_strstart;

        /* If the window is almost full and there is insufficient lookahead,
         * move the upper half to the lower one to make room in the upper half.
         */
        if(more == -1) {
            /* Very unlikely, but possible on 16 bit machine if strstart == 0
             * and lookahead == 1 (input done one byte at time)
             */
            more--;
        } else if(zip_strstart >= zip_WSIZE + zip_MAX_DIST) {
            /* By the IN assertion, the window is not empty so we can't confuse
             * more == 0 with more == 64K on a 16 bit machine.
             */
//	Assert(window_size == (ulg)2*WSIZE, "no sliding with BIG_MEM");

//	System.arraycopy(window, WSIZE, window, 0, WSIZE);
            for(n = 0; n < zip_WSIZE; n++)
                zip_window[n] = zip_window[n + zip_WSIZE];

            zip_match_start -= zip_WSIZE;
            zip_strstart    -= zip_WSIZE; /* we now have strstart >= MAX_DIST: */
            zip_block_start -= zip_WSIZE;

            for(n = 0; n < zip_HASH_SIZE; n++) {
                m = zip_head1(n);
                zip_head2(n, m >= zip_WSIZE ? m - zip_WSIZE : zip_NIL);
            }
            for(n = 0; n < zip_WSIZE; n++) {
                /* If n is not on any hash chain, prev[n] is garbage but
                 * its value will never be used.
                 */
                m = zip_prev[n];
                zip_prev[n] = (m >= zip_WSIZE ? m - zip_WSIZE : zip_NIL);
            }
            more += zip_WSIZE;
        }
        // At this point, more >= 2
        if(!zip_eofile) {
            n = zip_read_buff(zip_window, zip_strstart + zip_lookahead, more);
            if(n <= 0)
                zip_eofile = true;
            else
                zip_lookahead += n;
        }
    }

    /* ==========================================================================
     * Processes a new input file and return its compressed length. This
     * function does not perform lazy evaluationof matches and inserts
     * new strings in the dictionary only for unmatched strings or for short
     * matches. It is used only for the fast compression options.
     */
    var zip_deflate_fast = function() {
        while(zip_lookahead != 0 && zip_qhead == null) {
            var flush; // set if current block must be flushed

            /* Insert the string window[strstart .. strstart+2] in the
             * dictionary, and set hash_head to the head of the hash chain:
             */
            zip_INSERT_STRING();

            /* Find the longest match, discarding those <= prev_length.
             * At this point we have always match_length < MIN_MATCH
             */
            if(zip_hash_head != zip_NIL &&
                zip_strstart - zip_hash_head <= zip_MAX_DIST) {
                /* To simplify the code, we prevent matches with the string
                 * of window index 0 (in particular we have to avoid a match
                 * of the string with itself at the start of the input file).
                 */
                zip_match_length = zip_longest_match(zip_hash_head);
                /* longest_match() sets match_start */
                if(zip_match_length > zip_lookahead)
                    zip_match_length = zip_lookahead;
            }
            if(zip_match_length >= zip_MIN_MATCH) {
//	    check_match(strstart, match_start, match_length);

                flush = zip_ct_tally(zip_strstart - zip_match_start,
                    zip_match_length - zip_MIN_MATCH);
                zip_lookahead -= zip_match_length;

                /* Insert new strings in the hash table only if the match length
                 * is not too large. This saves time but degrades compression.
                 */
                if(zip_match_length <= zip_max_lazy_match) {
                    zip_match_length--; // string at strstart already in hash table
                    do {
                        zip_strstart++;
                        zip_INSERT_STRING();
                        /* strstart never exceeds WSIZE-MAX_MATCH, so there are
                         * always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
                         * these bytes are garbage, but it does not matter since
                         * the next lookahead bytes will be emitted as literals.
                         */
                    } while(--zip_match_length != 0);
                    zip_strstart++;
                } else {
                    zip_strstart += zip_match_length;
                    zip_match_length = 0;
                    zip_ins_h = zip_window[zip_strstart] & 0xff;
//		UPDATE_HASH(ins_h, window[strstart + 1]);
                    zip_ins_h = ((zip_ins_h<<zip_H_SHIFT) ^ (zip_window[zip_strstart + 1] & 0xff)) & zip_HASH_MASK;

//#if MIN_MATCH != 3
//		Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif

                }
            } else {
                /* No match, output a literal byte */
                flush = zip_ct_tally(0, zip_window[zip_strstart] & 0xff);
                zip_lookahead--;
                zip_strstart++;
            }
            if(flush) {
                zip_flush_block(0);
                zip_block_start = zip_strstart;
            }

            /* Make sure that we always have enough lookahead, except
             * at the end of the input file. We need MAX_MATCH bytes
             * for the next match, plus MIN_MATCH bytes to insert the
             * string following the next match.
             */
            while(zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile)
                zip_fill_window();
        }
    }

    var zip_deflate_better = function() {
        /* Process the input block. */
        while(zip_lookahead != 0 && zip_qhead == null) {
            /* Insert the string window[strstart .. strstart+2] in the
             * dictionary, and set hash_head to the head of the hash chain:
             */
            zip_INSERT_STRING();

            /* Find the longest match, discarding those <= prev_length.
             */
            zip_prev_length = zip_match_length;
            zip_prev_match = zip_match_start;
            zip_match_length = zip_MIN_MATCH - 1;

            if(zip_hash_head != zip_NIL &&
                zip_prev_length < zip_max_lazy_match &&
                zip_strstart - zip_hash_head <= zip_MAX_DIST) {
                /* To simplify the code, we prevent matches with the string
                 * of window index 0 (in particular we have to avoid a match
                 * of the string with itself at the start of the input file).
                 */
                zip_match_length = zip_longest_match(zip_hash_head);
                /* longest_match() sets match_start */
                if(zip_match_length > zip_lookahead)
                    zip_match_length = zip_lookahead;

                /* Ignore a length 3 match if it is too distant: */
                if(zip_match_length == zip_MIN_MATCH &&
                    zip_strstart - zip_match_start > zip_TOO_FAR) {
                    /* If prev_match is also MIN_MATCH, match_start is garbage
                     * but we will ignore the current match anyway.
                     */
                    zip_match_length--;
                }
            }
            /* If there was a match at the previous step and the current
             * match is not better, output the previous match:
             */
            if(zip_prev_length >= zip_MIN_MATCH &&
                zip_match_length <= zip_prev_length) {
                var flush; // set if current block must be flushed

//	    check_match(strstart - 1, prev_match, prev_length);
                flush = zip_ct_tally(zip_strstart - 1 - zip_prev_match,
                    zip_prev_length - zip_MIN_MATCH);

                /* Insert in hash table all strings up to the end of the match.
                 * strstart-1 and strstart are already inserted.
                 */
                zip_lookahead -= zip_prev_length - 1;
                zip_prev_length -= 2;
                do {
                    zip_strstart++;
                    zip_INSERT_STRING();
                    /* strstart never exceeds WSIZE-MAX_MATCH, so there are
                     * always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
                     * these bytes are garbage, but it does not matter since the
                     * next lookahead bytes will always be emitted as literals.
                     */
                } while(--zip_prev_length != 0);
                zip_match_available = 0;
                zip_match_length = zip_MIN_MATCH - 1;
                zip_strstart++;
                if(flush) {
                    zip_flush_block(0);
                    zip_block_start = zip_strstart;
                }
            } else if(zip_match_available != 0) {
                /* If there was no match at the previous position, output a
                 * single literal. If there was a match but the current match
                 * is longer, truncate the previous match to a single literal.
                 */
                if(zip_ct_tally(0, zip_window[zip_strstart - 1] & 0xff)) {
                    zip_flush_block(0);
                    zip_block_start = zip_strstart;
                }
                zip_strstart++;
                zip_lookahead--;
            } else {
                /* There is no previous match to compare with, wait for
                 * the next step to decide.
                 */
                zip_match_available = 1;
                zip_strstart++;
                zip_lookahead--;
            }

            /* Make sure that we always have enough lookahead, except
             * at the end of the input file. We need MAX_MATCH bytes
             * for the next match, plus MIN_MATCH bytes to insert the
             * string following the next match.
             */
            while(zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile)
                zip_fill_window();
        }
    }

    var zip_init_deflate = function() {
        if(zip_eofile)
            return;
        zip_bi_buf = 0;
        zip_bi_valid = 0;
        zip_ct_init();
        zip_lm_init();

        zip_qhead = null;
        zip_outcnt = 0;
        zip_outoff = 0;
        zip_match_available = 0;

        if(zip_compr_level <= 3)
        {
            zip_prev_length = zip_MIN_MATCH - 1;
            zip_match_length = 0;
        }
        else
        {
            zip_match_length = zip_MIN_MATCH - 1;
            zip_match_available = 0;
            zip_match_available = 0;
        }

        zip_complete = false;
    }

    /* ==========================================================================
     * Same as above, but achieves better compression. We use a lazy
     * evaluation for matches: a match is finally adopted only if there is
     * no better match at the next window position.
     */
    var zip_deflate_internal = function(buff, off, buff_size) {
        var n;

        if(!zip_initflag)
        {
            zip_init_deflate();
            zip_initflag = true;
            if(zip_lookahead == 0) { // empty
                zip_complete = true;
                return 0;
            }
        }

        if((n = zip_qcopy(buff, off, buff_size)) == buff_size)
            return buff_size;

        if(zip_complete)
            return n;

        if(zip_compr_level <= 3) // optimized for speed
            zip_deflate_fast();
        else
            zip_deflate_better();
        if(zip_lookahead == 0) {
            if(zip_match_available != 0)
                zip_ct_tally(0, zip_window[zip_strstart - 1] & 0xff);
            zip_flush_block(1);
            zip_complete = true;
        }
        return n + zip_qcopy(buff, n + off, buff_size - n);
    }

    var zip_qcopy = function(buff, off, buff_size) {
        var n, i, j;

        n = 0;
        while(zip_qhead != null && n < buff_size)
        {
            i = buff_size - n;
            if(i > zip_qhead.len)
                i = zip_qhead.len;
//      System.arraycopy(qhead.ptr, qhead.off, buff, off + n, i);
            for(j = 0; j < i; j++)
                buff[off + n + j] = zip_qhead.ptr[zip_qhead.off + j];

            zip_qhead.off += i;
            zip_qhead.len -= i;
            n += i;
            if(zip_qhead.len == 0) {
                var p;
                p = zip_qhead;
                zip_qhead = zip_qhead.next;
                zip_reuse_queue(p);
            }
        }

        if(n == buff_size)
            return n;

        if(zip_outoff < zip_outcnt) {
            i = buff_size - n;
            if(i > zip_outcnt - zip_outoff)
                i = zip_outcnt - zip_outoff;
            // System.arraycopy(outbuf, outoff, buff, off + n, i);
            for(j = 0; j < i; j++)
                buff[off + n + j] = zip_outbuf[zip_outoff + j];
            zip_outoff += i;
            n += i;
            if(zip_outcnt == zip_outoff)
                zip_outcnt = zip_outoff = 0;
        }
        return n;
    }

    /* ==========================================================================
     * Allocate the match buffer, initialize the various tables and save the
     * location of the internal file attribute (ascii/binary) and method
     * (DEFLATE/STORE).
     */
    var zip_ct_init = function() {
        var n;	// iterates over tree elements
        var bits;	// bit counter
        var length;	// length value
        var code;	// code value
        var dist;	// distance index

        if(zip_static_dtree[0].dl != 0) return; // ct_init already called

        zip_l_desc.dyn_tree		= zip_dyn_ltree;
        zip_l_desc.static_tree	= zip_static_ltree;
        zip_l_desc.extra_bits	= zip_extra_lbits;
        zip_l_desc.extra_base	= zip_LITERALS + 1;
        zip_l_desc.elems		= zip_L_CODES;
        zip_l_desc.max_length	= zip_MAX_BITS;
        zip_l_desc.max_code		= 0;

        zip_d_desc.dyn_tree		= zip_dyn_dtree;
        zip_d_desc.static_tree	= zip_static_dtree;
        zip_d_desc.extra_bits	= zip_extra_dbits;
        zip_d_desc.extra_base	= 0;
        zip_d_desc.elems		= zip_D_CODES;
        zip_d_desc.max_length	= zip_MAX_BITS;
        zip_d_desc.max_code		= 0;

        zip_bl_desc.dyn_tree	= zip_bl_tree;
        zip_bl_desc.static_tree	= null;
        zip_bl_desc.extra_bits	= zip_extra_blbits;
        zip_bl_desc.extra_base	= 0;
        zip_bl_desc.elems		= zip_BL_CODES;
        zip_bl_desc.max_length	= zip_MAX_BL_BITS;
        zip_bl_desc.max_code	= 0;

        // Initialize the mapping length (0..255) -> length code (0..28)
        length = 0;
        for(code = 0; code < zip_LENGTH_CODES-1; code++) {
            zip_base_length[code] = length;
            for(n = 0; n < (1<<zip_extra_lbits[code]); n++)
                zip_length_code[length++] = code;
        }
        // Assert (length == 256, "ct_init: length != 256");

        /* Note that the length 255 (match length 258) can be represented
         * in two different ways: code 284 + 5 bits or code 285, so we
         * overwrite length_code[255] to use the best encoding:
         */
        zip_length_code[length-1] = code;

        /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
        dist = 0;
        for(code = 0 ; code < 16; code++) {
            zip_base_dist[code] = dist;
            for(n = 0; n < (1<<zip_extra_dbits[code]); n++) {
                zip_dist_code[dist++] = code;
            }
        }
        // Assert (dist == 256, "ct_init: dist != 256");
        dist >>= 7; // from now on, all distances are divided by 128
        for( ; code < zip_D_CODES; code++) {
            zip_base_dist[code] = dist << 7;
            for(n = 0; n < (1<<(zip_extra_dbits[code]-7)); n++)
                zip_dist_code[256 + dist++] = code;
        }
        // Assert (dist == 256, "ct_init: 256+dist != 512");

        // Construct the codes of the static literal tree
        for(bits = 0; bits <= zip_MAX_BITS; bits++)
            zip_bl_count[bits] = 0;
        n = 0;
        while(n <= 143) { zip_static_ltree[n++].dl = 8; zip_bl_count[8]++; }
        while(n <= 255) { zip_static_ltree[n++].dl = 9; zip_bl_count[9]++; }
        while(n <= 279) { zip_static_ltree[n++].dl = 7; zip_bl_count[7]++; }
        while(n <= 287) { zip_static_ltree[n++].dl = 8; zip_bl_count[8]++; }
        /* Codes 286 and 287 do not exist, but we must include them in the
         * tree construction to get a canonical Huffman tree (longest code
         * all ones)
         */
        zip_gen_codes(zip_static_ltree, zip_L_CODES + 1);

        /* The static distance tree is trivial: */
        for(n = 0; n < zip_D_CODES; n++) {
            zip_static_dtree[n].dl = 5;
            zip_static_dtree[n].fc = zip_bi_reverse(n, 5);
        }

        // Initialize the first block of the first file:
        zip_init_block();
    }

    /* ==========================================================================
     * Initialize a new block.
     */
    var zip_init_block = function() {
        var n; // iterates over tree elements

        // Initialize the trees.
        for(n = 0; n < zip_L_CODES;  n++) zip_dyn_ltree[n].fc = 0;
        for(n = 0; n < zip_D_CODES;  n++) zip_dyn_dtree[n].fc = 0;
        for(n = 0; n < zip_BL_CODES; n++) zip_bl_tree[n].fc = 0;

        zip_dyn_ltree[zip_END_BLOCK].fc = 1;
        zip_opt_len = zip_static_len = 0;
        zip_last_lit = zip_last_dist = zip_last_flags = 0;
        zip_flags = 0;
        zip_flag_bit = 1;
    }

    /* ==========================================================================
     * Restore the heap property by moving down the tree starting at node k,
     * exchanging a node with the smallest of its two sons if necessary, stopping
     * when the heap property is re-established (each father smaller than its
     * two sons).
     */
    var zip_pqdownheap = function(
        tree,	// the tree to restore
        k) {	// node to move down
        var v = zip_heap[k];
        var j = k << 1;	// left son of k

        while(j <= zip_heap_len) {
            // Set j to the smallest of the two sons:
            if(j < zip_heap_len &&
                zip_SMALLER(tree, zip_heap[j + 1], zip_heap[j]))
                j++;

            // Exit if v is smaller than both sons
            if(zip_SMALLER(tree, v, zip_heap[j]))
                break;

            // Exchange v with the smallest son
            zip_heap[k] = zip_heap[j];
            k = j;

            // And continue down the tree, setting j to the left son of k
            j <<= 1;
        }
        zip_heap[k] = v;
    }

    /* ==========================================================================
     * Compute the optimal bit lengths for a tree and update the total bit length
     * for the current block.
     * IN assertion: the fields freq and dad are set, heap[heap_max] and
     *    above are the tree nodes sorted by increasing frequency.
     * OUT assertions: the field len is set to the optimal bit length, the
     *     array bl_count contains the frequencies for each bit length.
     *     The length opt_len is updated; static_len is also updated if stree is
     *     not null.
     */
    var zip_gen_bitlen = function(desc) { // the tree descriptor
        var tree		= desc.dyn_tree;
        var extra		= desc.extra_bits;
        var base		= desc.extra_base;
        var max_code	= desc.max_code;
        var max_length	= desc.max_length;
        var stree		= desc.static_tree;
        var h;		// heap index
        var n, m;		// iterate over the tree elements
        var bits;		// bit length
        var xbits;		// extra bits
        var f;		// frequency
        var overflow = 0;	// number of elements with bit length too large

        for(bits = 0; bits <= zip_MAX_BITS; bits++)
            zip_bl_count[bits] = 0;

        /* In a first pass, compute the optimal bit lengths (which may
         * overflow in the case of the bit length tree).
         */
        tree[zip_heap[zip_heap_max]].dl = 0; // root of the heap

        for(h = zip_heap_max + 1; h < zip_HEAP_SIZE; h++) {
            n = zip_heap[h];
            bits = tree[tree[n].dl].dl + 1;
            if(bits > max_length) {
                bits = max_length;
                overflow++;
            }
            tree[n].dl = bits;
            // We overwrite tree[n].dl which is no longer needed

            if(n > max_code)
                continue; // not a leaf node

            zip_bl_count[bits]++;
            xbits = 0;
            if(n >= base)
                xbits = extra[n - base];
            f = tree[n].fc;
            zip_opt_len += f * (bits + xbits);
            if(stree != null)
                zip_static_len += f * (stree[n].dl + xbits);
        }
        if(overflow == 0)
            return;

        // This happens for example on obj2 and pic of the Calgary corpus

        // Find the first bit length which could increase:
        do {
            bits = max_length - 1;
            while(zip_bl_count[bits] == 0)
                bits--;
            zip_bl_count[bits]--;		// move one leaf down the tree
            zip_bl_count[bits + 1] += 2;	// move one overflow item as its brother
            zip_bl_count[max_length]--;
            /* The brother of the overflow item also moves one step up,
             * but this does not affect bl_count[max_length]
             */
            overflow -= 2;
        } while(overflow > 0);

        /* Now recompute all bit lengths, scanning in increasing frequency.
         * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
         * lengths instead of fixing only the wrong ones. This idea is taken
         * from 'ar' written by Haruhiko Okumura.)
         */
        for(bits = max_length; bits != 0; bits--) {
            n = zip_bl_count[bits];
            while(n != 0) {
                m = zip_heap[--h];
                if(m > max_code)
                    continue;
                if(tree[m].dl != bits) {
                    zip_opt_len += (bits - tree[m].dl) * tree[m].fc;
                    tree[m].fc = bits;
                }
                n--;
            }
        }
    }

    /* ==========================================================================
     * Generate the codes for a given tree and bit counts (which need not be
     * optimal).
     * IN assertion: the array bl_count contains the bit length statistics for
     * the given tree and the field len is set for all tree elements.
     * OUT assertion: the field code is set for all tree elements of non
     *     zero code length.
     */
    var zip_gen_codes = function(tree,	// the tree to decorate
                                 max_code) {	// largest code with non zero frequency
        var next_code = new Array(zip_MAX_BITS+1); // next code value for each bit length
        var code = 0;		// running code value
        var bits;			// bit index
        var n;			// code index

        /* The distribution counts are first used to generate the code values
         * without bit reversal.
         */
        for(bits = 1; bits <= zip_MAX_BITS; bits++) {
            code = ((code + zip_bl_count[bits-1]) << 1);
            next_code[bits] = code;
        }

        /* Check that the bit counts in bl_count are consistent. The last code
         * must be all ones.
         */
//    Assert (code + encoder->bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
//	    "inconsistent bit counts");
//    Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

        for(n = 0; n <= max_code; n++) {
            var len = tree[n].dl;
            if(len == 0)
                continue;
            // Now reverse the bits
            tree[n].fc = zip_bi_reverse(next_code[len]++, len);

//      Tracec(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
//	  n, (isgraph(n) ? n : ' '), len, tree[n].fc, next_code[len]-1));
        }
    }

    /* ==========================================================================
     * Construct one Huffman tree and assigns the code bit strings and lengths.
     * Update the total bit length for the current block.
     * IN assertion: the field freq is set for all tree elements.
     * OUT assertions: the fields len and code are set to the optimal bit length
     *     and corresponding code. The length opt_len is updated; static_len is
     *     also updated if stree is not null. The field max_code is set.
     */
    var zip_build_tree = function(desc) { // the tree descriptor
        var tree	= desc.dyn_tree;
        var stree	= desc.static_tree;
        var elems	= desc.elems;
        var n, m;		// iterate over heap elements
        var max_code = -1;	// largest code with non zero frequency
        var node = elems;	// next internal node of the tree

        /* Construct the initial heap, with least frequent element in
         * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
         * heap[0] is not used.
         */
        zip_heap_len = 0;
        zip_heap_max = zip_HEAP_SIZE;

        for(n = 0; n < elems; n++) {
            if(tree[n].fc != 0) {
                zip_heap[++zip_heap_len] = max_code = n;
                zip_depth[n] = 0;
            } else
                tree[n].dl = 0;
        }

        /* The pkzip format requires that at least one distance code exists,
         * and that at least one bit should be sent even if there is only one
         * possible code. So to avoid special checks later on we force at least
         * two codes of non zero frequency.
         */
        while(zip_heap_len < 2) {
            var xnew = zip_heap[++zip_heap_len] = (max_code < 2 ? ++max_code : 0);
            tree[xnew].fc = 1;
            zip_depth[xnew] = 0;
            zip_opt_len--;
            if(stree != null)
                zip_static_len -= stree[xnew].dl;
            // new is 0 or 1 so it does not have extra bits
        }
        desc.max_code = max_code;

        /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
         * establish sub-heaps of increasing lengths:
         */
        for(n = zip_heap_len >> 1; n >= 1; n--)
            zip_pqdownheap(tree, n);

        /* Construct the Huffman tree by repeatedly combining the least two
         * frequent nodes.
         */
        do {
            n = zip_heap[zip_SMALLEST];
            zip_heap[zip_SMALLEST] = zip_heap[zip_heap_len--];
            zip_pqdownheap(tree, zip_SMALLEST);

            m = zip_heap[zip_SMALLEST];  // m = node of next least frequency

            // keep the nodes sorted by frequency
            zip_heap[--zip_heap_max] = n;
            zip_heap[--zip_heap_max] = m;

            // Create a new node father of n and m
            tree[node].fc = tree[n].fc + tree[m].fc;
//	depth[node] = (char)(MAX(depth[n], depth[m]) + 1);
            if(zip_depth[n] > zip_depth[m] + 1)
                zip_depth[node] = zip_depth[n];
            else
                zip_depth[node] = zip_depth[m] + 1;
            tree[n].dl = tree[m].dl = node;

            // and insert the new node in the heap
            zip_heap[zip_SMALLEST] = node++;
            zip_pqdownheap(tree, zip_SMALLEST);

        } while(zip_heap_len >= 2);

        zip_heap[--zip_heap_max] = zip_heap[zip_SMALLEST];

        /* At this point, the fields freq and dad are set. We can now
         * generate the bit lengths.
         */
        zip_gen_bitlen(desc);

        // The field len is now set, we can generate the bit codes
        zip_gen_codes(tree, max_code);
    }

    /* ==========================================================================
     * Scan a literal or distance tree to determine the frequencies of the codes
     * in the bit length tree. Updates opt_len to take into account the repeat
     * counts. (The contribution of the bit length codes will be added later
     * during the construction of bl_tree.)
     */
    var zip_scan_tree = function(tree,// the tree to be scanned
                                 max_code) {  // and its largest code of non zero frequency
        var n;			// iterates over all tree elements
        var prevlen = -1;		// last emitted length
        var curlen;			// length of current code
        var nextlen = tree[0].dl;	// length of next code
        var count = 0;		// repeat count of the current code
        var max_count = 7;		// max repeat count
        var min_count = 4;		// min repeat count

        if(nextlen == 0) {
            max_count = 138;
            min_count = 3;
        }
        tree[max_code + 1].dl = 0xffff; // guard

        for(n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[n + 1].dl;
            if(++count < max_count && curlen == nextlen)
                continue;
            else if(count < min_count)
                zip_bl_tree[curlen].fc += count;
            else if(curlen != 0) {
                if(curlen != prevlen)
                    zip_bl_tree[curlen].fc++;
                zip_bl_tree[zip_REP_3_6].fc++;
            } else if(count <= 10)
                zip_bl_tree[zip_REPZ_3_10].fc++;
            else
                zip_bl_tree[zip_REPZ_11_138].fc++;
            count = 0; prevlen = curlen;
            if(nextlen == 0) {
                max_count = 138;
                min_count = 3;
            } else if(curlen == nextlen) {
                max_count = 6;
                min_count = 3;
            } else {
                max_count = 7;
                min_count = 4;
            }
        }
    }

    /* ==========================================================================
     * Send a literal or distance tree in compressed form, using the codes in
     * bl_tree.
     */
    var zip_send_tree = function(tree, // the tree to be scanned
                                 max_code) { // and its largest code of non zero frequency
        var n;			// iterates over all tree elements
        var prevlen = -1;		// last emitted length
        var curlen;			// length of current code
        var nextlen = tree[0].dl;	// length of next code
        var count = 0;		// repeat count of the current code
        var max_count = 7;		// max repeat count
        var min_count = 4;		// min repeat count

        /* tree[max_code+1].dl = -1; */  /* guard already set */
        if(nextlen == 0) {
            max_count = 138;
            min_count = 3;
        }

        for(n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[n+1].dl;
            if(++count < max_count && curlen == nextlen) {
                continue;
            } else if(count < min_count) {
                do { zip_SEND_CODE(curlen, zip_bl_tree); } while(--count != 0);
            } else if(curlen != 0) {
                if(curlen != prevlen) {
                    zip_SEND_CODE(curlen, zip_bl_tree);
                    count--;
                }
                // Assert(count >= 3 && count <= 6, " 3_6?");
                zip_SEND_CODE(zip_REP_3_6, zip_bl_tree);
                zip_send_bits(count - 3, 2);
            } else if(count <= 10) {
                zip_SEND_CODE(zip_REPZ_3_10, zip_bl_tree);
                zip_send_bits(count-3, 3);
            } else {
                zip_SEND_CODE(zip_REPZ_11_138, zip_bl_tree);
                zip_send_bits(count-11, 7);
            }
            count = 0;
            prevlen = curlen;
            if(nextlen == 0) {
                max_count = 138;
                min_count = 3;
            } else if(curlen == nextlen) {
                max_count = 6;
                min_count = 3;
            } else {
                max_count = 7;
                min_count = 4;
            }
        }
    }

    /* ==========================================================================
     * Construct the Huffman tree for the bit lengths and return the index in
     * bl_order of the last bit length code to send.
     */
    var zip_build_bl_tree = function() {
        var max_blindex;  // index of last bit length code of non zero freq

        // Determine the bit length frequencies for literal and distance trees
        zip_scan_tree(zip_dyn_ltree, zip_l_desc.max_code);
        zip_scan_tree(zip_dyn_dtree, zip_d_desc.max_code);

        // Build the bit length tree:
        zip_build_tree(zip_bl_desc);
        /* opt_len now includes the length of the tree representations, except
         * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
         */

        /* Determine the number of bit length codes to send. The pkzip format
         * requires that at least 4 bit length codes be sent. (appnote.txt says
         * 3 but the actual value used is 4.)
         */
        for(max_blindex = zip_BL_CODES-1; max_blindex >= 3; max_blindex--) {
            if(zip_bl_tree[zip_bl_order[max_blindex]].dl != 0) break;
        }
        /* Update opt_len to include the bit length tree and counts */
        zip_opt_len += 3*(max_blindex+1) + 5+5+4;
//    Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
//	    encoder->opt_len, encoder->static_len));

        return max_blindex;
    }

    /* ==========================================================================
     * Send the header for a block using dynamic Huffman trees: the counts, the
     * lengths of the bit length codes, the literal tree and the distance tree.
     * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
     */
    var zip_send_all_trees = function(lcodes, dcodes, blcodes) { // number of codes for each tree
        var rank; // index in bl_order

//    Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
//    Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
//	    "too many codes");
//    Tracev((stderr, "\nbl counts: "));
        zip_send_bits(lcodes-257, 5); // not +255 as stated in appnote.txt
        zip_send_bits(dcodes-1,   5);
        zip_send_bits(blcodes-4,  4); // not -3 as stated in appnote.txt
        for(rank = 0; rank < blcodes; rank++) {
//      Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
            zip_send_bits(zip_bl_tree[zip_bl_order[rank]].dl, 3);
        }

        // send the literal tree
        zip_send_tree(zip_dyn_ltree,lcodes-1);

        // send the distance tree
        zip_send_tree(zip_dyn_dtree,dcodes-1);
    }

    /* ==========================================================================
     * Determine the best encoding for the current block: dynamic trees, static
     * trees or store, and output the encoded block to the zip file.
     */
    var zip_flush_block = function(eof) { // true if this is the last block for a file
        var opt_lenb, static_lenb; // opt_len and static_len in bytes
        var max_blindex;	// index of last bit length code of non zero freq
        var stored_len;	// length of input block

        stored_len = zip_strstart - zip_block_start;
        zip_flag_buf[zip_last_flags] = zip_flags; // Save the flags for the last 8 items

        // Construct the literal and distance trees
        zip_build_tree(zip_l_desc);
//    Tracev((stderr, "\nlit data: dyn %ld, stat %ld",
//	    encoder->opt_len, encoder->static_len));

        zip_build_tree(zip_d_desc);
//    Tracev((stderr, "\ndist data: dyn %ld, stat %ld",
//	    encoder->opt_len, encoder->static_len));
        /* At this point, opt_len and static_len are the total bit lengths of
         * the compressed block data, excluding the tree representations.
         */

        /* Build the bit length tree for the above two trees, and get the index
         * in bl_order of the last bit length code to send.
         */
        max_blindex = zip_build_bl_tree();

        // Determine the best encoding. Compute first the block length in bytes
        opt_lenb	= (zip_opt_len   +3+7)>>3;
        static_lenb = (zip_static_len+3+7)>>3;

//    Trace((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u dist %u ",
//	   opt_lenb, encoder->opt_len,
//	   static_lenb, encoder->static_len, stored_len,
//	   encoder->last_lit, encoder->last_dist));

        if(static_lenb <= opt_lenb)
            opt_lenb = static_lenb;
        if(stored_len + 4 <= opt_lenb // 4: two words for the lengths
            && zip_block_start >= 0) {
            var i;

            /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
             * Otherwise we can't have processed more than WSIZE input bytes since
             * the last block flush, because compression would have been
             * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
             * transform a block into a stored block.
             */
            zip_send_bits((zip_STORED_BLOCK<<1)+eof, 3);  /* send block type */
            zip_bi_windup();		 /* align on byte boundary */
            zip_put_short(stored_len);
            zip_put_short(~stored_len);

            // copy block
            /*
             p = &window[block_start];
             for(i = 0; i < stored_len; i++)
             put_byte(p[i]);
             */
            for(i = 0; i < stored_len; i++)
                zip_put_byte(zip_window[zip_block_start + i]);

        } else if(static_lenb == opt_lenb) {
            zip_send_bits((zip_STATIC_TREES<<1)+eof, 3);
            zip_compress_block(zip_static_ltree, zip_static_dtree);
        } else {
            zip_send_bits((zip_DYN_TREES<<1)+eof, 3);
            zip_send_all_trees(zip_l_desc.max_code+1,
                zip_d_desc.max_code+1,
                max_blindex+1);
            zip_compress_block(zip_dyn_ltree, zip_dyn_dtree);
        }

        zip_init_block();

        if(eof != 0)
            zip_bi_windup();
    }

    /* ==========================================================================
     * Save the match info and tally the frequency counts. Return true if
     * the current block must be flushed.
     */
    var zip_ct_tally = function(
        dist, // distance of matched string
        lc) { // match length-MIN_MATCH or unmatched char (if dist==0)
        zip_l_buf[zip_last_lit++] = lc;
        if(dist == 0) {
            // lc is the unmatched char
            zip_dyn_ltree[lc].fc++;
        } else {
            // Here, lc is the match length - MIN_MATCH
            dist--;		    // dist = match distance - 1
//      Assert((ush)dist < (ush)MAX_DIST &&
//	     (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
//	     (ush)D_CODE(dist) < (ush)D_CODES,  "ct_tally: bad match");

            zip_dyn_ltree[zip_length_code[lc]+zip_LITERALS+1].fc++;
            zip_dyn_dtree[zip_D_CODE(dist)].fc++;

            zip_d_buf[zip_last_dist++] = dist;
            zip_flags |= zip_flag_bit;
        }
        zip_flag_bit <<= 1;

        // Output the flags if they fill a byte
        if((zip_last_lit & 7) == 0) {
            zip_flag_buf[zip_last_flags++] = zip_flags;
            zip_flags = 0;
            zip_flag_bit = 1;
        }
        // Try to guess if it is profitable to stop the current block here
        if(zip_compr_level > 2 && (zip_last_lit & 0xfff) == 0) {
            // Compute an upper bound for the compressed length
            var out_length = zip_last_lit * 8;
            var in_length = zip_strstart - zip_block_start;
            var dcode;

            for(dcode = 0; dcode < zip_D_CODES; dcode++) {
                out_length += zip_dyn_dtree[dcode].fc * (5 + zip_extra_dbits[dcode]);
            }
            out_length >>= 3;
//      Trace((stderr,"\nlast_lit %u, last_dist %u, in %ld, out ~%ld(%ld%%) ",
//	     encoder->last_lit, encoder->last_dist, in_length, out_length,
//	     100L - out_length*100L/in_length));
            if(zip_last_dist < parseInt(zip_last_lit/2) &&
                out_length < parseInt(in_length/2))
                return true;
        }
        return (zip_last_lit == zip_LIT_BUFSIZE-1 ||
        zip_last_dist == zip_DIST_BUFSIZE);
        /* We avoid equality with LIT_BUFSIZE because of wraparound at 64K
         * on 16 bit machines and because stored blocks are restricted to
         * 64K-1 bytes.
         */
    }

    /* ==========================================================================
     * Send the block data compressed using the given Huffman trees
     */
    var zip_compress_block = function(
        ltree,	// literal tree
        dtree) {	// distance tree
        var dist;		// distance of matched string
        var lc;		// match length or unmatched char (if dist == 0)
        var lx = 0;		// running index in l_buf
        var dx = 0;		// running index in d_buf
        var fx = 0;		// running index in flag_buf
        var flag = 0;	// current flags
        var code;		// the code to send
        var extra;		// number of extra bits to send

        if(zip_last_lit != 0) do {
            if((lx & 7) == 0)
                flag = zip_flag_buf[fx++];
            lc = zip_l_buf[lx++] & 0xff;
            if((flag & 1) == 0) {
                zip_SEND_CODE(lc, ltree); /* send a literal byte */
//	Tracecv(isgraph(lc), (stderr," '%c' ", lc));
            } else {
                // Here, lc is the match length - MIN_MATCH
                code = zip_length_code[lc];
                zip_SEND_CODE(code+zip_LITERALS+1, ltree); // send the length code
                extra = zip_extra_lbits[code];
                if(extra != 0) {
                    lc -= zip_base_length[code];
                    zip_send_bits(lc, extra); // send the extra length bits
                }
                dist = zip_d_buf[dx++];
                // Here, dist is the match distance - 1
                code = zip_D_CODE(dist);
//	Assert (code < D_CODES, "bad d_code");

                zip_SEND_CODE(code, dtree);	  // send the distance code
                extra = zip_extra_dbits[code];
                if(extra != 0) {
                    dist -= zip_base_dist[code];
                    zip_send_bits(dist, extra);   // send the extra distance bits
                }
            } // literal or match pair ?
            flag >>= 1;
        } while(lx < zip_last_lit);

        zip_SEND_CODE(zip_END_BLOCK, ltree);
    }

    /* ==========================================================================
     * Send a value on a given number of bits.
     * IN assertion: length <= 16 and value fits in length bits.
     */
    var zip_Buf_size = 16; // bit size of bi_buf
    var zip_send_bits = function(
        value,	// value to send
        length) {	// number of bits
        /* If not enough room in bi_buf, use (valid) bits from bi_buf and
         * (16 - bi_valid) bits from value, leaving (width - (16-bi_valid))
         * unused bits in value.
         */
        if(zip_bi_valid > zip_Buf_size - length) {
            zip_bi_buf |= (value << zip_bi_valid);
            zip_put_short(zip_bi_buf);
            zip_bi_buf = (value >> (zip_Buf_size - zip_bi_valid));
            zip_bi_valid += length - zip_Buf_size;
        } else {
            zip_bi_buf |= value << zip_bi_valid;
            zip_bi_valid += length;
        }
    }

    /* ==========================================================================
     * Reverse the first len bits of a code, using straightforward code (a faster
     * method would use a table)
     * IN assertion: 1 <= len <= 15
     */
    var zip_bi_reverse = function(
        code,	// the value to invert
        len) {	// its bit length
        var res = 0;
        do {
            res |= code & 1;
            code >>= 1;
            res <<= 1;
        } while(--len > 0);
        return res >> 1;
    }

    /* ==========================================================================
     * Write out any remaining bits in an incomplete byte.
     */
    var zip_bi_windup = function() {
        if(zip_bi_valid > 8) {
            zip_put_short(zip_bi_buf);
        } else if(zip_bi_valid > 0) {
            zip_put_byte(zip_bi_buf);
        }
        zip_bi_buf = 0;
        zip_bi_valid = 0;
    }

    var zip_qoutbuf = function() {
        if(zip_outcnt != 0) {
            var q, i;
            q = zip_new_queue();
            if(zip_qhead == null)
                zip_qhead = zip_qtail = q;
            else
                zip_qtail = zip_qtail.next = q;
            q.len = zip_outcnt - zip_outoff;
//      System.arraycopy(zip_outbuf, zip_outoff, q.ptr, 0, q.len);
            for(i = 0; i < q.len; i++)
                q.ptr[i] = zip_outbuf[zip_outoff + i];
            zip_outcnt = zip_outoff = 0;
        }
    }

    var zip_deflate = function(str, level) {
        var i, j;

        zip_deflate_data = str;
        zip_deflate_pos = 0;
        if(typeof level == "undefined")
            level = zip_DEFAULT_LEVEL;
        zip_deflate_start(level);

        var buff = new Array(1024);
        var aout = [];
        while((i = zip_deflate_internal(buff, 0, buff.length)) > 0) {
            var cbuf = new Array(i);
            for(j = 0; j < i; j++){
                cbuf[j] = String.fromCharCode(buff[j]);
            }
            aout[aout.length] = cbuf.join("");
        }
        zip_deflate_data = null; // G.C.
        return aout.join("");
    }

    if (! ctx.RawDeflate) ctx.RawDeflate = {};
    ctx.RawDeflate.deflate = zip_deflate;

})(this);


//***** rawinflate.js ver. 0.3 2013/04/09 **************************************
//***** https://github.com/dankogai/js-deflate *********************************

(function(ctx){
    /*
     * $Id: rawinflate.js,v 0.3 2013/04/09 14:25:38 dankogai Exp dankogai $
     *
     * GNU General Public License, version 2 (GPL-2.0)
     *   http://opensource.org/licenses/GPL-2.0
     * original:
     *   http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
     */

    /* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0.0.1
     * LastModified: Dec 25 1999
     */

    /* Interface:
     * data = zip_inflate(src);
     */

    /* constant parameters */
    var zip_WSIZE = 32768;		// Sliding Window size
    var zip_STORED_BLOCK = 0;
    var zip_STATIC_TREES = 1;
    var zip_DYN_TREES    = 2;

    /* for inflate */
    var zip_lbits = 9; 		// bits in base literal/length lookup table
    var zip_dbits = 6; 		// bits in base distance lookup table
    var zip_INBUFSIZ = 32768;	// Input buffer size
    var zip_INBUF_EXTRA = 64;	// Extra buffer

    /* variables (inflate) */
    var zip_slide;
    var zip_wp;			// current position in slide
    var zip_fixed_tl = null;	// inflate static
    var zip_fixed_td;		// inflate static
    var zip_fixed_bl, zip_fixed_bd;	// inflate static
    var zip_bit_buf;		// bit buffer
    var zip_bit_len;		// bits in bit buffer
    var zip_method;
    var zip_eof;
    var zip_copy_leng;
    var zip_copy_dist;
    var zip_tl, zip_td;	// literal/length and distance decoder tables
    var zip_bl, zip_bd;	// number of bits decoded by tl and td

    var zip_inflate_data;
    var zip_inflate_pos;


    /* constant tables (inflate) */
    var zip_MASK_BITS = new Array(
        0x0000,
        0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
        0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff);
// Tables for deflate from PKZIP's appnote.txt.
    var zip_cplens = new Array( // Copy lengths for literal codes 257..285
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0);
    /* note: see note #13 above about the 258 in this list. */
    var zip_cplext = new Array( // Extra bits for literal codes 257..285
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99); // 99==invalid
    var zip_cpdist = new Array( // Copy offsets for distance codes 0..29
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
        257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
        8193, 12289, 16385, 24577);
    var zip_cpdext = new Array( // Extra bits for distance codes
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
        7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
        12, 12, 13, 13);
    var zip_border = new Array(  // Order of the bit length code lengths
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
    /* objects (inflate) */

    var zip_HuftList = function() {
        this.next = null;
        this.list = null;
    }

    var zip_HuftNode = function() {
        this.e = 0; // number of extra bits or operation
        this.b = 0; // number of bits in this code or subcode

        // union
        this.n = 0; // literal, length base, or distance base
        this.t = null; // (zip_HuftNode) pointer to next level of table
    }

    var zip_HuftBuild = function(b,	// code lengths in bits (all assumed <= BMAX)
                                 n,	// number of codes (assumed <= N_MAX)
                                 s,	// number of simple-valued codes (0..s-1)
                                 d,	// list of base values for non-simple codes
                                 e,	// list of extra bits for non-simple codes
                                 mm	// maximum lookup bits
    ) {
        this.BMAX = 16;   // maximum bit length of any code
        this.N_MAX = 288; // maximum number of codes in any set
        this.status = 0;	// 0: success, 1: incomplete table, 2: bad input
        this.root = null;	// (zip_HuftList) starting table
        this.m = 0;		// maximum lookup bits, returns actual

        /* Given a list of code lengths and a maximum table size, make a set of
         tables to decode that set of codes.	Return zero on success, one if
         the given code set is incomplete (the tables are still built in this
         case), two if the input is invalid (all zero length codes or an
         oversubscribed set of lengths), and three if not enough memory.
         The code with value 256 is special, and the tables are constructed
         so that no bits beyond that code are fetched when that code is
         decoded. */
        {
            var a;			// counter for codes of length k
            var c = new Array(this.BMAX+1);	// bit length count table
            var el;			// length of EOB code (value 256)
            var f;			// i repeats in table every f entries
            var g;			// maximum code length
            var h;			// table level
            var i;			// counter, current code
            var j;			// counter
            var k;			// number of bits in current code
            var lx = new Array(this.BMAX+1);	// stack of bits per table
            var p;			// pointer into c[], b[], or v[]
            var pidx;		// index of p
            var q;			// (zip_HuftNode) points to current table
            var r = new zip_HuftNode(); // table entry for structure assignment
            var u = new Array(this.BMAX); // zip_HuftNode[BMAX][]  table stack
            var v = new Array(this.N_MAX); // values in order of bit length
            var w;
            var x = new Array(this.BMAX+1);// bit offsets, then code stack
            var xp;			// pointer into x or c
            var y;			// number of dummy codes added
            var z;			// number of entries in current table
            var o;
            var tail;		// (zip_HuftList)

            tail = this.root = null;
            for(i = 0; i < c.length; i++)
                c[i] = 0;
            for(i = 0; i < lx.length; i++)
                lx[i] = 0;
            for(i = 0; i < u.length; i++)
                u[i] = null;
            for(i = 0; i < v.length; i++)
                v[i] = 0;
            for(i = 0; i < x.length; i++)
                x[i] = 0;

            // Generate counts for each bit length
            el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
            p = b; pidx = 0;
            i = n;
            do {
                c[p[pidx]]++;	// assume all entries <= BMAX
                pidx++;
            } while(--i > 0);
            if(c[0] == n) {	// null input--all zero length codes
                this.root = null;
                this.m = 0;
                this.status = 0;
                return;
            }

            // Find minimum and maximum length, bound *m by those
            for(j = 1; j <= this.BMAX; j++)
                if(c[j] != 0)
                    break;
            k = j;			// minimum code length
            if(mm < j)
                mm = j;
            for(i = this.BMAX; i != 0; i--)
                if(c[i] != 0)
                    break;
            g = i;			// maximum code length
            if(mm > i)
                mm = i;

            // Adjust last length count to fill out codes, if needed
            for(y = 1 << j; j < i; j++, y <<= 1)
                if((y -= c[j]) < 0) {
                    this.status = 2;	// bad input: more codes than bits
                    this.m = mm;
                    return;
                }
            if((y -= c[i]) < 0) {
                this.status = 2;
                this.m = mm;
                return;
            }
            c[i] += y;

            // Generate starting offsets into the value table for each length
            x[1] = j = 0;
            p = c;
            pidx = 1;
            xp = 2;
            while(--i > 0)		// note that i == g from above
                x[xp++] = (j += p[pidx++]);

            // Make a table of values in order of bit lengths
            p = b; pidx = 0;
            i = 0;
            do {
                if((j = p[pidx++]) != 0)
                    v[x[j]++] = i;
            } while(++i < n);
            n = x[g];			// set n to length of v

            // Generate the Huffman codes and for each, make the table entries
            x[0] = i = 0;		// first Huffman code is zero
            p = v; pidx = 0;		// grab values in bit order
            h = -1;			// no tables yet--level -1
            w = lx[0] = 0;		// no bits decoded yet
            q = null;			// ditto
            z = 0;			// ditto

            // go through the bit lengths (k already is bits in shortest code)
            for(; k <= g; k++) {
                a = c[k];
                while(a-- > 0) {
                    // here i is the Huffman code of length k bits for value p[pidx]
                    // make tables up to required level
                    while(k > w + lx[1 + h]) {
                        w += lx[1 + h]; // add bits already decoded
                        h++;

                        // compute minimum size table less than or equal to *m bits
                        z = (z = g - w) > mm ? mm : z; // upper limit
                        if((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
                            // too few codes for k-w bit table
                            f -= a + 1;	// deduct codes from patterns left
                            xp = k;
                            while(++j < z) { // try smaller tables up to z bits
                                if((f <<= 1) <= c[++xp])
                                    break;	// enough codes to use up j bits
                                f -= c[xp];	// else deduct codes from patterns
                            }
                        }
                        if(w + j > el && w < el)
                            j = el - w;	// make EOB code end at table
                        z = 1 << j;	// table entries for j-bit table
                        lx[1 + h] = j; // set table size in stack

                        // allocate and link in new table
                        q = new Array(z);
                        for(o = 0; o < z; o++) {
                            q[o] = new zip_HuftNode();
                        }

                        if(tail == null)
                            tail = this.root = new zip_HuftList();
                        else
                            tail = tail.next = new zip_HuftList();
                        tail.next = null;
                        tail.list = q;
                        u[h] = q;	// table starts after link

                        /* connect to last table, if there is one */
                        if(h > 0) {
                            x[h] = i;		// save pattern for backing up
                            r.b = lx[h];	// bits to dump before this table
                            r.e = 16 + j;	// bits in this table
                            r.t = q;		// pointer to this table
                            j = (i & ((1 << w) - 1)) >> (w - lx[h]);
                            u[h-1][j].e = r.e;
                            u[h-1][j].b = r.b;
                            u[h-1][j].n = r.n;
                            u[h-1][j].t = r.t;
                        }
                    }

                    // set up table entry in r
                    r.b = k - w;
                    if(pidx >= n)
                        r.e = 99;		// out of values--invalid code
                    else if(p[pidx] < s) {
                        r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
                        r.n = p[pidx++];	// simple code is just the value
                    } else {
                        r.e = e[p[pidx] - s];	// non-simple--look up in lists
                        r.n = d[p[pidx++] - s];
                    }

                    // fill code-like entries with r //
                    f = 1 << (k - w);
                    for(j = i >> w; j < z; j += f) {
                        q[j].e = r.e;
                        q[j].b = r.b;
                        q[j].n = r.n;
                        q[j].t = r.t;
                    }

                    // backwards increment the k-bit code i
                    for(j = 1 << (k - 1); (i & j) != 0; j >>= 1)
                        i ^= j;
                    i ^= j;

                    // backup over finished tables
                    while((i & ((1 << w) - 1)) != x[h]) {
                        w -= lx[h];		// don't need to update q
                        h--;
                    }
                }
            }

            /* return actual size of base table */
            this.m = lx[1];

            /* Return true (1) if we were given an incomplete table */
            this.status = ((y != 0 && g != 1) ? 1 : 0);
        } /* end of constructor */
    }


    /* routines (inflate) */

    var zip_GET_BYTE = function() {
        if(zip_inflate_data.length == zip_inflate_pos)
            return -1;
        return zip_inflate_data.charCodeAt(zip_inflate_pos++) & 0xff;
    }

    var zip_NEEDBITS = function(n) {
        while(zip_bit_len < n) {
            zip_bit_buf |= zip_GET_BYTE() << zip_bit_len;
            zip_bit_len += 8;
        }
    }

    var zip_GETBITS = function(n) {
        return zip_bit_buf & zip_MASK_BITS[n];
    }

    var zip_DUMPBITS = function(n) {
        zip_bit_buf >>= n;
        zip_bit_len -= n;
    }

    var zip_inflate_codes = function(buff, off, size) {
        /* inflate (decompress) the codes in a deflated (compressed) block.
         Return an error code or zero if it all goes ok. */
        var e;		// table entry flag/number of extra bits
        var t;		// (zip_HuftNode) pointer to table entry
        var n;

        if(size == 0)
            return 0;

        // inflate the coded data
        n = 0;
        for(;;) {			// do until end of block
            zip_NEEDBITS(zip_bl);
            t = zip_tl.list[zip_GETBITS(zip_bl)];
            e = t.e;
            while(e > 16) {
                if(e == 99)
                    return -1;
                zip_DUMPBITS(t.b);
                e -= 16;
                zip_NEEDBITS(e);
                t = t.t[zip_GETBITS(e)];
                e = t.e;
            }
            zip_DUMPBITS(t.b);

            if(e == 16) {		// then it's a literal
                zip_wp &= zip_WSIZE - 1;
                buff[off + n++] = zip_slide[zip_wp++] = t.n;
                if(n == size)
                    return size;
                continue;
            }

            // exit if end of block
            if(e == 15)
                break;

            // it's an EOB or a length

            // get length of block to copy
            zip_NEEDBITS(e);
            zip_copy_leng = t.n + zip_GETBITS(e);
            zip_DUMPBITS(e);

            // decode distance of block to copy
            zip_NEEDBITS(zip_bd);
            t = zip_td.list[zip_GETBITS(zip_bd)];
            e = t.e;

            while(e > 16) {
                if(e == 99)
                    return -1;
                zip_DUMPBITS(t.b);
                e -= 16;
                zip_NEEDBITS(e);
                t = t.t[zip_GETBITS(e)];
                e = t.e;
            }
            zip_DUMPBITS(t.b);
            zip_NEEDBITS(e);
            zip_copy_dist = zip_wp - t.n - zip_GETBITS(e);
            zip_DUMPBITS(e);

            // do the copy
            while(zip_copy_leng > 0 && n < size) {
                zip_copy_leng--;
                zip_copy_dist &= zip_WSIZE - 1;
                zip_wp &= zip_WSIZE - 1;
                buff[off + n++] = zip_slide[zip_wp++]
                    = zip_slide[zip_copy_dist++];
            }

            if(n == size)
                return size;
        }

        zip_method = -1; // done
        return n;
    }

    var zip_inflate_stored = function(buff, off, size) {
        /* "decompress" an inflated type 0 (stored) block. */
        var n;

        // go to byte boundary
        n = zip_bit_len & 7;
        zip_DUMPBITS(n);

        // get the length and its complement
        zip_NEEDBITS(16);
        n = zip_GETBITS(16);
        zip_DUMPBITS(16);
        zip_NEEDBITS(16);
        if(n != ((~zip_bit_buf) & 0xffff))
            return -1;			// error in compressed data
        zip_DUMPBITS(16);

        // read and output the compressed data
        zip_copy_leng = n;

        n = 0;
        while(zip_copy_leng > 0 && n < size) {
            zip_copy_leng--;
            zip_wp &= zip_WSIZE - 1;
            zip_NEEDBITS(8);
            buff[off + n++] = zip_slide[zip_wp++] =
                zip_GETBITS(8);
            zip_DUMPBITS(8);
        }

        if(zip_copy_leng == 0)
            zip_method = -1; // done
        return n;
    }

    var zip_inflate_fixed = function(buff, off, size) {
        /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
         either replace this with a custom decoder, or at least precompute the
         Huffman tables. */

        // if first time, set up tables for fixed blocks
        if(zip_fixed_tl == null) {
            var i;			// temporary variable
            var l = new Array(288);	// length list for huft_build
            var h;	// zip_HuftBuild

            // literal table
            for(i = 0; i < 144; i++)
                l[i] = 8;
            for(; i < 256; i++)
                l[i] = 9;
            for(; i < 280; i++)
                l[i] = 7;
            for(; i < 288; i++)	// make a complete, but wrong code set
                l[i] = 8;
            zip_fixed_bl = 7;

            h = new zip_HuftBuild(l, 288, 257, zip_cplens, zip_cplext,
                zip_fixed_bl);
            if(h.status != 0) {
                alert("HufBuild error: "+h.status);
                return -1;
            }
            zip_fixed_tl = h.root;
            zip_fixed_bl = h.m;

            // distance table
            for(i = 0; i < 30; i++)	// make an incomplete code set
                l[i] = 5;
            zip_fixed_bd = 5;

            h = new zip_HuftBuild(l, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd);
            if(h.status > 1) {
                zip_fixed_tl = null;
                alert("HufBuild error: "+h.status);
                return -1;
            }
            zip_fixed_td = h.root;
            zip_fixed_bd = h.m;
        }

        zip_tl = zip_fixed_tl;
        zip_td = zip_fixed_td;
        zip_bl = zip_fixed_bl;
        zip_bd = zip_fixed_bd;
        return zip_inflate_codes(buff, off, size);
    }

    var zip_inflate_dynamic = function(buff, off, size) {
        // decompress an inflated type 2 (dynamic Huffman codes) block.
        var i;		// temporary variables
        var j;
        var l;		// last length
        var n;		// number of lengths to get
        var t;		// (zip_HuftNode) literal/length code table
        var nb;		// number of bit length codes
        var nl;		// number of literal/length codes
        var nd;		// number of distance codes
        var ll = new Array(286+30); // literal/length and distance code lengths
        var h;		// (zip_HuftBuild)

        for(i = 0; i < ll.length; i++)
            ll[i] = 0;

        // read in table lengths
        zip_NEEDBITS(5);
        nl = 257 + zip_GETBITS(5);	// number of literal/length codes
        zip_DUMPBITS(5);
        zip_NEEDBITS(5);
        nd = 1 + zip_GETBITS(5);	// number of distance codes
        zip_DUMPBITS(5);
        zip_NEEDBITS(4);
        nb = 4 + zip_GETBITS(4);	// number of bit length codes
        zip_DUMPBITS(4);
        if(nl > 286 || nd > 30)
            return -1;		// bad lengths

        // read in bit-length-code lengths
        for(j = 0; j < nb; j++)
        {
            zip_NEEDBITS(3);
            ll[zip_border[j]] = zip_GETBITS(3);
            zip_DUMPBITS(3);
        }
        for(; j < 19; j++)
            ll[zip_border[j]] = 0;

        // build decoding table for trees--single level, 7 bit lookup
        zip_bl = 7;
        h = new zip_HuftBuild(ll, 19, 19, null, null, zip_bl);
        if(h.status != 0)
            return -1;	// incomplete code set

        zip_tl = h.root;
        zip_bl = h.m;

        // read in literal and distance code lengths
        n = nl + nd;
        i = l = 0;
        while(i < n) {
            zip_NEEDBITS(zip_bl);
            t = zip_tl.list[zip_GETBITS(zip_bl)];
            j = t.b;
            zip_DUMPBITS(j);
            j = t.n;
            if(j < 16)		// length of code in bits (0..15)
                ll[i++] = l = j;	// save last length in l
            else if(j == 16) {	// repeat last length 3 to 6 times
                zip_NEEDBITS(2);
                j = 3 + zip_GETBITS(2);
                zip_DUMPBITS(2);
                if(i + j > n)
                    return -1;
                while(j-- > 0)
                    ll[i++] = l;
            } else if(j == 17) {	// 3 to 10 zero length codes
                zip_NEEDBITS(3);
                j = 3 + zip_GETBITS(3);
                zip_DUMPBITS(3);
                if(i + j > n)
                    return -1;
                while(j-- > 0)
                    ll[i++] = 0;
                l = 0;
            } else {		// j == 18: 11 to 138 zero length codes
                zip_NEEDBITS(7);
                j = 11 + zip_GETBITS(7);
                zip_DUMPBITS(7);
                if(i + j > n)
                    return -1;
                while(j-- > 0)
                    ll[i++] = 0;
                l = 0;
            }
        }

        // build the decoding tables for literal/length and distance codes
        zip_bl = zip_lbits;
        h = new zip_HuftBuild(ll, nl, 257, zip_cplens, zip_cplext, zip_bl);
        if(zip_bl == 0)	// no literals or lengths
            h.status = 1;
        if(h.status != 0) {
            if(h.status == 1)
                ;// **incomplete literal tree**
            return -1;		// incomplete code set
        }
        zip_tl = h.root;
        zip_bl = h.m;

        for(i = 0; i < nd; i++)
            ll[i] = ll[i + nl];
        zip_bd = zip_dbits;
        h = new zip_HuftBuild(ll, nd, 0, zip_cpdist, zip_cpdext, zip_bd);
        zip_td = h.root;
        zip_bd = h.m;

        if(zip_bd == 0 && nl > 257) {   // lengths but no distances
            // **incomplete distance tree**
            return -1;
        }

        if(h.status == 1) {
            ;// **incomplete distance tree**
        }
        if(h.status != 0)
            return -1;

        // decompress until an end-of-block code
        return zip_inflate_codes(buff, off, size);
    }

    var zip_inflate_start = function() {
        var i;

        if(zip_slide == null)
            zip_slide = new Array(2 * zip_WSIZE);
        zip_wp = 0;
        zip_bit_buf = 0;
        zip_bit_len = 0;
        zip_method = -1;
        zip_eof = false;
        zip_copy_leng = zip_copy_dist = 0;
        zip_tl = null;
    }

    var zip_inflate_internal = function(buff, off, size) {
        // decompress an inflated entry
        var n, i;

        n = 0;
        while(n < size) {
            if(zip_eof && zip_method == -1)
                return n;

            if(zip_copy_leng > 0) {
                if(zip_method != zip_STORED_BLOCK) {
                    // STATIC_TREES or DYN_TREES
                    while(zip_copy_leng > 0 && n < size) {
                        zip_copy_leng--;
                        zip_copy_dist &= zip_WSIZE - 1;
                        zip_wp &= zip_WSIZE - 1;
                        buff[off + n++] = zip_slide[zip_wp++] =
                            zip_slide[zip_copy_dist++];
                    }
                } else {
                    while(zip_copy_leng > 0 && n < size) {
                        zip_copy_leng--;
                        zip_wp &= zip_WSIZE - 1;
                        zip_NEEDBITS(8);
                        buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
                        zip_DUMPBITS(8);
                    }
                    if(zip_copy_leng == 0)
                        zip_method = -1; // done
                }
                if(n == size)
                    return n;
            }

            if(zip_method == -1) {
                if(zip_eof)
                    break;

                // read in last block bit
                zip_NEEDBITS(1);
                if(zip_GETBITS(1) != 0)
                    zip_eof = true;
                zip_DUMPBITS(1);

                // read in block type
                zip_NEEDBITS(2);
                zip_method = zip_GETBITS(2);
                zip_DUMPBITS(2);
                zip_tl = null;
                zip_copy_leng = 0;
            }

            switch(zip_method) {
                case 0: // zip_STORED_BLOCK
                    i = zip_inflate_stored(buff, off + n, size - n);
                    break;

                case 1: // zip_STATIC_TREES
                    if(zip_tl != null)
                        i = zip_inflate_codes(buff, off + n, size - n);
                    else
                        i = zip_inflate_fixed(buff, off + n, size - n);
                    break;

                case 2: // zip_DYN_TREES
                    if(zip_tl != null)
                        i = zip_inflate_codes(buff, off + n, size - n);
                    else
                        i = zip_inflate_dynamic(buff, off + n, size - n);
                    break;

                default: // error
                    i = -1;
                    break;
            }

            if(i == -1) {
                if(zip_eof)
                    return 0;
                return -1;
            }
            n += i;
        }
        return n;
    }

    var zip_inflate = function(str) {
        var i, j;

        zip_inflate_start();
        zip_inflate_data = str;
        zip_inflate_pos = 0;

        var buff = new Array(1024);
        var aout = [];
        while((i = zip_inflate_internal(buff, 0, buff.length)) > 0) {
            var cbuf = new Array(i);
            for(j = 0; j < i; j++){
                cbuf[j] = String.fromCharCode(buff[j]);
            }
            aout[aout.length] = cbuf.join("");
        }
        zip_inflate_data = null; // G.C.
        return aout.join("");
    }

    if (! ctx.RawDeflate) ctx.RawDeflate = {};
    ctx.RawDeflate.inflate = zip_inflate;

})(this);


//***** json2.js ver. 2015-02-25 ***********************************************
//***** https://github.com/douglascrockford/JSON-js ****************************

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? '0' + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
            f(this.getUTCMonth() + 1) + '-' +
            f(this.getUTCDate()) + 'T' +
            f(this.getUTCHours()) + ':' +
            f(this.getUTCMinutes()) + ':' +
            f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string)
            ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"'
            : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value)
                    ? String(value)
                    : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ': '
                                        : ':'
                                ) + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ': '
                                        : ':'
                                ) + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                /^[\],:{}\s]*$/.test(
                    text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

//***** FileSaver.js ver. 1.1.20160328 *****************************************
/*! http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js ******/

var saveAs = saveAs || (function(view) {
        "use strict";
        // IE <10 is explicitly unsupported
        if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var
            doc = view.document
        // only get URL when necessary in case Blob.js hasn't overridden it yet
            , get_URL = function() {
                return view.URL || view.webkitURL || view;
            }
            , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
            , can_use_save_link = "download" in save_link
            , click = function(node) {
                var event = new MouseEvent("click");
                node.dispatchEvent(event);
            }
            , is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
            , webkit_req_fs = view.webkitRequestFileSystem
            , req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
            , throw_outside = function(ex) {
                (view.setImmediate || view.setTimeout)(function() {
                    throw ex;
                }, 0);
            }
            , force_saveable_type = "application/octet-stream"
            , fs_min_size = 0
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
            , arbitrary_revoke_timeout = 1000 * 40 // in ms
            , revoke = function(file) {
                var revoker = function() {
                    if (typeof file === "string") { // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else { // file is a File
                        file.remove();
                    }
                };
                /* // Take note W3C:
                 var
                 uri = typeof file === "string" ? file : file.toURL()
                 , revoker = function(evt) {
                 // idealy DownloadFinishedEvent.data would be the URL requested
                 if (evt.data === uri) {
                 if (typeof file === "string") { // file is an object URL
                 get_URL().revokeObjectURL(file);
                 } else { // file is a File
                 file.remove();
                 }
                 }
                 }
                 ;
                 view.addEventListener("downloadfinished", revoker);
                 */
                setTimeout(revoker, arbitrary_revoke_timeout);
            }
            , dispatch = function(filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver["on" + event_types[i]];
                    if (typeof listener === "function") {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            }
            , auto_bom = function(blob) {
                // prepend BOM for UTF-8 XML and text/* types (including HTML)
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob(["\ufeff", blob], {type: blob.type});
                }
                return blob;
            }
            , FileSaver = function(blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                // First try a.download, then web filesystem, then object URLs
                var
                    filesaver = this
                    , type = blob.type
                    , blob_changed = false
                    , object_url
                    , target_view
                    , dispatch_all = function() {
                        dispatch(filesaver, "writestart progress write writeend".split(" "));
                    }
                // on any filesys errors revert to saving with object URLs
                    , fs_error = function() {
                        if (target_view && is_safari && typeof FileReader !== "undefined") {
                            // Safari doesn't allow downloading of blob urls
                            var reader = new FileReader();
                            reader.onloadend = function() {
                                var base64Data = reader.result;
                                target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                            };
                            reader.readAsDataURL(blob);
                            filesaver.readyState = filesaver.INIT;
                            return;
                        }
                        // don't create more object URLs than needed
                        if (blob_changed || !object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (target_view) {
                            target_view.location.href = object_url;
                        } else {
                            var new_tab = view.open(object_url, "_blank");
                            if (new_tab === undefined && is_safari) {
                                //Apple do not allow window.open, see http://bit.ly/1kZffRI
                                view.location.href = object_url
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    }
                    , abortable = function(func) {
                        return function() {
                            if (filesaver.readyState !== filesaver.DONE) {
                                return func.apply(this, arguments);
                            }
                        };
                    }
                    , create_if_not_found = {create: true, exclusive: false}
                    , slice
                    ;
                filesaver.readyState = filesaver.INIT;
                if (!name) {
                    name = "download";
                }
                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    setTimeout(function() {
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        dispatch_all();
                        revoke(object_url);
                        filesaver.readyState = filesaver.DONE;
                    });
                    return;
                }
                // Object and web filesystem URLs have a problem saving in Google Chrome when
                // viewed in a tab, so I force save with application/octet-stream
                // http://code.google.com/p/chromium/issues/detail?id=91158
                // Update: Google errantly closed 91158, I submitted it again:
                // https://code.google.com/p/chromium/issues/detail?id=389642
                if (view.chrome && type && type !== force_saveable_type) {
                    slice = blob.slice || blob.webkitSlice;
                    blob = slice.call(blob, 0, blob.size, force_saveable_type);
                    blob_changed = true;
                }
                // Since I can't be sure that the guessed media type will trigger a download
                // in WebKit, I append .download to the filename.
                // https://bugs.webkit.org/show_bug.cgi?id=65440
                if (webkit_req_fs && name !== "download") {
                    name += ".download";
                }
                if (type === force_saveable_type || webkit_req_fs) {
                    target_view = view;
                }
                if (!req_fs) {
                    fs_error();
                    return;
                }
                fs_min_size += blob.size;
                req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
                    fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
                        var save = function() {
                            dir.getFile(name, create_if_not_found, abortable(function(file) {
                                file.createWriter(abortable(function(writer) {
                                    writer.onwriteend = function(event) {
                                        target_view.location.href = file.toURL();
                                        filesaver.readyState = filesaver.DONE;
                                        dispatch(filesaver, "writeend", event);
                                        revoke(file);
                                    };
                                    writer.onerror = function() {
                                        var error = writer.error;
                                        if (error.code !== error.ABORT_ERR) {
                                            fs_error();
                                        }
                                    };
                                    "writestart progress write abort".split(" ").forEach(function(event) {
                                        writer["on" + event] = filesaver["on" + event];
                                    });
                                    writer.write(blob);
                                    filesaver.abort = function() {
                                        writer.abort();
                                        filesaver.readyState = filesaver.DONE;
                                    };
                                    filesaver.readyState = filesaver.WRITING;
                                }), fs_error);
                            }), fs_error);
                        };
                        dir.getFile(name, {create: false}, abortable(function(file) {
                            // delete file if it already exists
                            file.remove();
                            save();
                        }), abortable(function(ex) {
                            if (ex.code === ex.NOT_FOUND_ERR) {
                                save();
                            } else {
                                fs_error();
                            }
                        }));
                    }), fs_error);
                }), fs_error);
            }
            , FS_proto = FileSaver.prototype
            , saveAs = function(blob, name, no_auto_bom) {
                return new FileSaver(blob, name, no_auto_bom);
            }
            ;
        // IE 10+ (native saveAs)
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function(blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                return navigator.msSaveOrOpenBlob(blob, name || "download");
            };
        }

        FS_proto.abort = function() {
            var filesaver = this;
            filesaver.readyState = filesaver.DONE;
            dispatch(filesaver, "abort");
        };
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error =
        FS_proto.onwritestart =
        FS_proto.onprogress =
        FS_proto.onwrite =
        FS_proto.onabort =
        FS_proto.onerror =
        FS_proto.onwriteend =
            null;

        return saveAs;
    }(
        typeof self !== "undefined" && self
        || typeof window !== "undefined" && window
        || this.content
    ));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
    module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
    define([], function() {
        return saveAs;
    });
}

//***** SaveTextAs ver. 2014-06-24 *********************************************
//***** https://github.com/ChenWenBrian/FileSaver.js ***************************

if(!String.prototype.endsWithAny)
{
    String.prototype.endsWithAny = function () {
        var strArray = Array.prototype.slice.call(arguments),
            $this = this.toLowerCase().toString();
        for (var i = 0; i < strArray.length; i++) {
            if ($this.indexOf(strArray[i], $this.length - strArray[i].length) !== -1) return true;
        }
        return false;
    };
}

var saveTextAs = saveTextAs
        || (function (textContent, fileName, charset) {
            fileName = fileName || 'download.txt';
            charset = charset || 'utf-8';
            textContent = (textContent || '').replace(/\r?\n/g, "\r\n");
            if (saveAs && Blob) {
                var blob = new Blob([textContent], { type: "text/plain;charset=" + charset });
                saveAs(blob, fileName);
                return true;
            } else {//IE9-
                var saveTxtWindow = window.frames.saveTxtWindow;
                if (!saveTxtWindow) {
                    saveTxtWindow = document.createElement('iframe');
                    saveTxtWindow.id = 'saveTxtWindow';
                    saveTxtWindow.style.display = 'none';
                    document.body.insertBefore(saveTxtWindow, null);
                    saveTxtWindow = window.frames.saveTxtWindow;
                    if (!saveTxtWindow) {
                        saveTxtWindow = window.open('', '_temp', 'width=100,height=100');
                        if (!saveTxtWindow) {
                            window.alert('Sorry, download file could not be created.');
                            return false;
                        }
                    }
                }

                var doc = saveTxtWindow.document;
                doc.open('text/plain', 'replace');
                doc.charset = charset;
                if (fileName.endsWithAny('.htm', '.html')) {
                    doc.close();
                    doc.body.innerHTML = '\r\n' + textContent + '\r\n';
                } else {
                    if (!fileName.endsWithAny('.txt')) fileName += '.txt';
                    doc.write(textContent);
                    doc.close();
                }

                var retValue = doc.execCommand('SaveAs', null, fileName);
                saveTxtWindow.close();
                return retValue;
            }
        })

//***** Blob.js ver. 2014-07-24  ***********************************************
//***** https://github.com/eligrey/Blob.js *************************************
    ;(function (view) {
    "use strict";

    view.URL = view.URL || view.webkitURL;

    if (view.Blob && view.URL) {
        try {
            new Blob;
            return;
        } catch (e) {}
    }

    // Internally we use a BlobBuilder implementation to base Blob off of
    // in order to support older browsers that only have BlobBuilder
    var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
            var
                get_class = function(object) {
                    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
                }
                , FakeBlobBuilder = function BlobBuilder() {
                    this.data = [];
                }
                , FakeBlob = function Blob(data, type, encoding) {
                    this.data = data;
                    this.size = data.length;
                    this.type = type;
                    this.encoding = encoding;
                }
                , FBB_proto = FakeBlobBuilder.prototype
                , FB_proto = FakeBlob.prototype
                , FileReaderSync = view.FileReaderSync
                , FileException = function(type) {
                    this.code = this[this.name = type];
                }
                , file_ex_codes = (
                "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
                + "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
                ).split(" ")
                , file_ex_code = file_ex_codes.length
                , real_URL = view.URL || view.webkitURL || view
                , real_create_object_URL = real_URL.createObjectURL
                , real_revoke_object_URL = real_URL.revokeObjectURL
                , URL = real_URL
                , btoa = view.btoa
                , atob = view.atob

                , ArrayBuffer = view.ArrayBuffer
                , Uint8Array = view.Uint8Array

                , origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
                ;
            FakeBlob.fake = FB_proto.fake = true;
            while (file_ex_code--) {
                FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
            }
            // Polyfill URL
            if (!real_URL.createObjectURL) {
                URL = view.URL = function(uri) {
                    var
                        uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
                        , uri_origin
                        ;
                    uri_info.href = uri;
                    if (!("origin" in uri_info)) {
                        if (uri_info.protocol.toLowerCase() === "data:") {
                            uri_info.origin = null;
                        } else {
                            uri_origin = uri.match(origin);
                            uri_info.origin = uri_origin && uri_origin[1];
                        }
                    }
                    return uri_info;
                };
            }
            URL.createObjectURL = function(blob) {
                var
                    type = blob.type
                    , data_URI_header
                    ;
                if (type === null) {
                    type = "application/octet-stream";
                }
                if (blob instanceof FakeBlob) {
                    data_URI_header = "data:" + type;
                    if (blob.encoding === "base64") {
                        return data_URI_header + ";base64," + blob.data;
                    } else if (blob.encoding === "URI") {
                        return data_URI_header + "," + decodeURIComponent(blob.data);
                    } if (btoa) {
                        return data_URI_header + ";base64," + btoa(blob.data);
                    } else {
                        return data_URI_header + "," + encodeURIComponent(blob.data);
                    }
                } else if (real_create_object_URL) {
                    return real_create_object_URL.call(real_URL, blob);
                }
            };
            URL.revokeObjectURL = function(object_URL) {
                if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
                    real_revoke_object_URL.call(real_URL, object_URL);
                }
            };
            FBB_proto.append = function(data/*, endings*/) {
                var bb = this.data;
                // decode data to a binary string
                if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
                    var
                        str = ""
                        , buf = new Uint8Array(data)
                        , i = 0
                        , buf_len = buf.length
                        ;
                    for (; i < buf_len; i++) {
                        str += String.fromCharCode(buf[i]);
                    }
                    bb.push(str);
                } else if (get_class(data) === "Blob" || get_class(data) === "File") {
                    if (FileReaderSync) {
                        var fr = new FileReaderSync;
                        bb.push(fr.readAsBinaryString(data));
                    } else {
                        // async FileReader won't work as BlobBuilder is sync
                        throw new FileException("NOT_READABLE_ERR");
                    }
                } else if (data instanceof FakeBlob) {
                    if (data.encoding === "base64" && atob) {
                        bb.push(atob(data.data));
                    } else if (data.encoding === "URI") {
                        bb.push(decodeURIComponent(data.data));
                    } else if (data.encoding === "raw") {
                        bb.push(data.data);
                    }
                } else {
                    if (typeof data !== "string") {
                        data += ""; // convert unsupported types to strings
                    }
                    // decode UTF-16 to binary string
                    bb.push(unescape(encodeURIComponent(data)));
                }
            };
            FBB_proto.getBlob = function(type) {
                if (!arguments.length) {
                    type = null;
                }
                return new FakeBlob(this.data.join(""), type, "raw");
            };
            FBB_proto.toString = function() {
                return "[object BlobBuilder]";
            };
            FB_proto.slice = function(start, end, type) {
                var args = arguments.length;
                if (args < 3) {
                    type = null;
                }
                return new FakeBlob(
                    this.data.slice(start, args > 1 ? end : this.data.length)
                    , type
                    , this.encoding
                );
            };
            FB_proto.toString = function() {
                return "[object Blob]";
            };
            FB_proto.close = function() {
                this.size = 0;
                delete this.data;
            };
            return FakeBlobBuilder;
        }(view));

    view.Blob = function(blobParts, options) {
        var type = options ? (options.type || "") : "";
        var builder = new BlobBuilder();
        if (blobParts) {
            for (var i = 0, len = blobParts.length; i < len; i++) {
                if (Uint8Array && blobParts[i] instanceof Uint8Array) {
                    builder.append(blobParts[i].buffer);
                }
                else {
                    builder.append(blobParts[i]);
                }
            }
        }
        var blob = builder.getBlob(type);
        if (!blob.slice && blob.webkitSlice) {
            blob.slice = blob.webkitSlice;
        }
        return blob;
    };

    var getPrototypeOf = Object.getPrototypeOf || function(object) {
            return object.__proto__;
        };
    view.Blob.prototype = getPrototypeOf(new view.Blob());
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));

//***** seedrandom.js ver. 2015-02-19  *****************************************
//***** https://github.com/davidbau/seedrandom/tree/master *********************

;(function (pool, math) {
//
// The following constants are related to IEEE 754 limits.
//
    var global = this,
        width = 256,        // each RC4 output is 0 <= x < 256
        chunks = 6,         // at least six RC4 outputs for each double
        digits = 52,        // there are 52 significant digits in a double
        rngname = 'random', // rngname: name for Math.random and Math.seedrandom
        startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
    function seedrandom(seed, options, callback) {
        var key = [];
        options = (options == true) ? { entropy: true } : (options || {});

        // Flatten the seed string or build one from local entropy if needed.
        var shortseed = mixkey(flatten(
            options.entropy ? [seed, tostring(pool)] :
                (seed == null) ? autoseed() : seed, 3), key);

        // Use the seed to initialize an ARC4 generator.
        var arc4 = new ARC4(key);

        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        var prng = function() {
            var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
                d = startdenom,                 //   and denominator d = 2 ^ 48.
                x = 0;                          //   and no 'extra last byte'.
            while (n < significance) {          // Fill up all significant digits by
                n = (n + x) * width;              //   shifting numerator and
                d *= width;                       //   denominator and generating a
                x = arc4.g(1);                    //   new least-significant-byte.
            }
            while (n >= overflow) {             // To avoid rounding up, before adding
                n /= 2;                           //   last byte, shift everything
                d /= 2;                           //   right using integer math until
                x >>>= 1;                         //   we have exactly the desired bits.
            }
            return (n + x) / d;                 // Form the number within [0, 1).
        };

        prng.int32 = function() { return arc4.g(4) | 0; }
        prng.quick = function() { return arc4.g(4) / ((1 << 30) * 4); }
        prng.double = prng;

        // Mix the randomness into accumulated entropy.
        mixkey(tostring(arc4.S), pool);

        // Calling convention: what to return as a function of prng, seed, is_math.
        return (options.pass || callback ||
        function(prng, seed, is_math_call, state) {
            if (state) {
                // Load the arc4 state from the given state if it has an S array.
                if (state.S) { copy(state, arc4); }
                // Only provide the .state method if requested via options.state.
                prng.state = function() { return copy(arc4, {}); }
            }

            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) { math[rngname] = prng; return seed; }

            // Otherwise, it is a newer calling convention, so return the
            // prng directly.
            else return prng;
        })(
            prng,
            shortseed,
            'global' in options ? options.global : (this == math),
            options.state);
    }
    math['seed' + rngname] = seedrandom;

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
    function ARC4(key) {
        var t, keylen = key.length,
            me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

        // The empty key [] is treated as [0].
        if (!keylen) { key = [keylen++]; }

        // Set up S using the standard key scheduling algorithm.
        while (i < width) {
            s[i] = i++;
        }
        for (i = 0; i < width; i++) {
            s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
            s[j] = t;
        }

        // The "g" method returns the next (count) outputs as one number.
        (me.g = function(count) {
            // Using instance members instead of closure state nearly doubles speed.
            var t, r = 0,
                i = me.i, j = me.j, s = me.S;
            while (count--) {
                t = s[i = mask & (i + 1)];
                r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
            }
            me.i = i; me.j = j;
            return r;
            // For robust unpredictability, the function call below automatically
            // discards an initial batch of values.  This is called RC4-drop[256].
            // See http://google.com/search?q=rsa+fluhrer+response&btnI
        })(width);
    }

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
    function copy(f, t) {
        t.i = f.i;
        t.j = f.j;
        t.S = f.S.slice();
        return t;
    };

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
    function flatten(obj, depth) {
        var result = [], typ = (typeof obj), prop;
        if (depth && typ == 'object') {
            for (prop in obj) {
                try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
            }
        }
        return (result.length ? result : typ == 'string' ? obj : obj + '\0');
    }

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
    function mixkey(seed, key) {
        var stringseed = seed + '', smear, j = 0;
        while (j < stringseed.length) {
            key[mask & j] =
                mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
        }
        return tostring(key);
    }

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
    function autoseed() {
        try {
            if (nodecrypto) { return tostring(nodecrypto.randomBytes(width)); }
            var out = new Uint8Array(width);
            global.crypto.getRandomValues(out);
            return tostring(out);
        } catch (e) {
            var browser = global.navigator,
                plugins = browser && browser.plugins;
            return [+new Date, global, plugins, global.screen, tostring(pool)];
        }
    }

//
// tostring()
// Converts an array of charcodes to a string
//
    function tostring(a) {
        return String.fromCharCode.apply(0, a);
    }

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
    mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
    if ((typeof module) == 'object' && module.exports) {
        module.exports = seedrandom;
        // When in node.js, try using crypto package for autoseeding.
        try {
            nodecrypto = require('crypto');
        } catch (ex) {}
    } else if ((typeof define) == 'function' && define.amd) {
        define(function() { return seedrandom; });
    }

// End anonymous scope, and pass initial values.
})(
    [],     // pool: entropy pool starts empty
    Math    // math: package containing random, pow, and seedrandom
);

Math.seedrandom('TestMyBrain');

//***** setImmediate.js ********************************************************
//***** https://github.com/YuzuJS/setImmediate *********************************

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));


if (!Array.prototype.shuffle)
{
    Array.prototype.shuffle = function()
    {
        for(var j, x, i = this.length;
            i;
            j = parseInt(Math.random() * i),x = this[--i],this[i] = this[j],this[j] = x)
        {};

        return this;
    };
}

if(!Array.prototype.random)
{
    Array.prototype.random = function()
    {
        return this[randInt(this.length)];
    }

}

if(!Array.prototype.invoke)
{
    Array.prototype.invoke = function (fun)
    {
        // enforce length as an unsigned 32-bit integer
        var len = this.length >>> 0;
        if (typeof fun !== "function")
        {
            throw new TypeError('Argument is not a function.',
                'Array.prototype.invoke');
        }

        var thisp = arguments[1];
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                res.push(fun.call(thisp, this[i]));
            }
        }
        return res;
    }
}

if(!Array.prototype.pluck)
{
    Array.prototype.pluck = function(key)
    {
        "use strict";

        if (!key || typeof key !== 'string')
            throw new TypeError ('Argument must be a string.');

        return this.map(function (member)
        {
            var value;
            if(member[key] !== undefined)
            {
                value = typeof member[key] === 'function' ?
                    member[key]() :
                    member[key];
            }
            else
            {
                value = undefined;
            }
            return value;
        });
    };
}

if(!Array.prototype.unique)
{
    Array.prototype.unique = function ()
    {
        "use strict";

        return this.reduce(function (out, elem)
        {
            if (out.indexOf(elem) === -1) out.push(elem);
            return out;
        }, []);
    }
}

if (!Array.prototype.includes)
{
    Array.prototype.includes = function(searchElement)
    {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}
if(!Array.prototype.contains)
    Array.prototype.contains = Array.prototype.includes; // alias compatible with zen.js

if (!Array.prototype.fill)
{
    Array.prototype.fill = function(value)
    {
        if (this === null)
        {
            throw new TypeError("'this' is null or not defined");
        }

        var O = Object(this);
        var len = O.length >>> 0;
        var start = arguments[1];
        var relativeStart = start >> 0;
        var k = relativeStart < 0 ? Math.max(len + relativeStart, 0)
            : Math.min(relativeStart, len);
        var end = arguments[2];
        var relativeEnd = end === undefined ? len : end >> 0;
        var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0)
            : Math.min(relativeEnd, len);

        while (k < final)
        {
            O[k] = value;
            k++;
        }

        return O;
    };
}

if(!Array.prototype.flatten)
{
    Array.prototype.flatten = function flatten()
    {
        var flat = [];
        for (var i = 0, l = this.length; i < l; i++)
        {
            var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
            if (type)
            {
                flat = flat.concat(/^(array|collection|arguments)$/.test(type) ?
                    flatten.call(this[i]) :
                    this[i]);
            }
        }
        return flat;
    }

}

if(!Array.prototype.partition)
{
    Array.prototype.partition = function(f)
    {
        if (!(typeof f === "function"))
        {
            throw new TypeError("Argument of Array.prototype.partition " +
            "must be a function.");
        }
        var matches = [], rejects = [], val;
        for (var i = 0, len = this.length; i < len; i++) {
            val = this[i];
            if (f(val)) {
                matches.push(val);
            } else {
                rejects.push(val);
            }
        }
        return [matches, rejects];
    }
}

if(!Array.prototype.zip)
{
    Array.prototype.zip = function(a)
    {
        var r = [];
        if (a.length !== this.length) {
            throw new TypeError("Array.prototype.zip: arrays must be equal length");
        }
        for(var i=0, len = this.length; i<len;i++)
        {
            r.push([this[i], a[i]]);
        }
        return r;
    }
}

if(!Array.prototype.sum)
{
    Array.prototype.sum = function()
    {
        var i = this.length;
        var s = 0;
        while(i--) s += this[i];
        return s;
    }
}

if(!Array.prototype.average)
{
    Array.prototype.average = function()
    {
        if (!this.length) return null;
        return this.sum()/this.length;
    }
}

if(!Array.prototype.variance)
{
    Array.prototype.variance = function()
    {
        if (!this.length) return null;

        var i, avg, len, demean, sumSquare = 0 , sumError = 0;

        avg = this.average();
        len = this.length;

        for(i = 0; i < len; i++)
        {
            demean = this[i] - avg;
            sumSquare += demean * demean;
            sumError += demean;
        }
        sumError *= sumError / len;

        return (sumSquare - sumError) / (len - 1);
    }
}

if(!Array.prototype.sd)
{
    Array.prototype.sd = function()
    {
        if (!this.length) return null;

        var variance = this.variance();

        return Math.sqrt(variance);
    }
}

if(!Array.prototype.median)
{
    Array.prototype.median = function()
    {
        if (!this.length) return null;

        var ar = this.slice();
        var mid = Math.floor(ar.length / 2);

        ar.sort(function (a,b){return a - b});

        if ((ar.length % 2) === 1)
            return ar[mid];
        else
            return (ar[mid - 1] + ar[mid]) / 2;
    }
}

var tmbObjs = {params: {},elements: {},frames: {},slides: {}};

tmbObjs.params =(location.href.split("?")[1]) ?
                (location.href.split("?")[1]).split("&").reduce(
                function(cumulative,current)
                {
                    cumulative[current.split("=")[0]] = current.split("=")[1];
                    return cumulative;
                },{}) :
                {};
var zen = tmbObjs; // alias compatible with zen.js

var hasTouch = ("ontouchend" in window ||
                navigator.maxTouchPoints ||
                navigator.msMaxTouchPoints || false);

var hasPointer = (window.PointerEvent || window.MSPointerEvent || false);

(function()
{
    var method;
    var noop = function () {};
    var methods = ['assert','clear','count','debug','dir','dirxml','error',
                   'exception','group','groupCollapsed','groupEnd','info','log',
                   'markTimeline','profile','profileEnd','table','time',
                   'timeEnd','timeline','timelineEnd','timeStamp','trace','warn'
                  ];
    var length = methods.length;
    var console = (window.console = window.console || {});
    while (length--)
    {
        method = methods[length];

        if (!console[method]) // Only stub undefined methods.
        {
            console[method] = noop;
        }
    }
}());

(function()
{
    var ____loadingSlide, loadInterval;

    if (document.createElement &&
       (____loadingSlide = document.createElement('div')))
    {
        ____loadingSlide.id = "____loading_slide";
        ____loadingSlide.style.display = "none";
        ____loadingSlide.style.textAlign = "center";
        ____loadingSlide.style.paddingTop = "40px";
        ____loadingSlide.style.fontWeight = "bold";
        ____loadingSlide.style.fontSize = "x-large";
        ____loadingSlide.innerHTML = "Working....";

        loadInterval = setInterval(function()
        {
            if(document.readyState !== "loading")
            {
                clearInterval(loadInterval);
                document.body.appendChild(____loadingSlide);
            }
        }, 100);

        window.addEventListener("beforeunload",function(){showFrame("____loading_slide");},true);
        //onbeforeunload = function() {showFrame("____loading_slide");};
    }
})();


function getID(id, cache)
{
    return !cache ? document.getElementById(id) :
                    (tmbObjs.elements[id] = tmbObjs.elements[id] ||
                                            document.getElementById(id));
}
var $$$ = getID; // alias compatible with zen.js

function showFrame()
{
    var showF, i;
    var args = [];

    if(arguments.length === 1 && arguments[0] instanceof Array)
        args = arguments[0];
    else
        for(i = 0; i < arguments.length; i++) args[i] = arguments[i];

    if(!tmbObjs.frames.length) tmbObjs.frames = document.getElementsByTagName("div");
    i = tmbObjs.frames.length;

    while(i--)
    {
        showF = (args.indexOf(tmbObjs.frames[i].id) > -1 ? 'block' : 'none');
        if (tmbObjs.frames[i].style.display === showF) continue;
        tmbObjs.frames[i].style.display = showF;
    }
}

function showFrameClass(divClass)
{
    var showF, i;
    var args = [];

    if(arguments.length === 1 && arguments[0] instanceof Array)
        args = arguments[0];
    else
        for(i = 0; i < arguments.length; i++) args[i] = arguments[i];

    if(!tmbObjs.frames.length) tmbObjs.frames = document.getElementsByTagName("div");
    i = tmbObjs.frames.length;

    while(i--)
    {
        showF = (args.indexOf(tmbObjs.frames[i].className) > -1 ? 'block' : 'none');
        if (tmbObjs.frames[i].style.display === showF) continue;
        tmbObjs.frames[i].style.display = showF;
    }
}

function showSlide(id)
{
    if (!tmbObjs.slides.length)
    {
        tmbObjs.slides = document.getElementsByClassName("slide");
    }

    var change_to, slides = tmbObjs.slides;
    var i = tmbObjs.slides.length;

    while(i--) {
        change_to = (slides[i].id === id ? 'block' : 'none');
        if (slides[i].style.display === change_to) continue;
        slides[i].style.display = change_to;
    }
}

function showAlert(alertMessage,alertButtonText,action,fontSize,timeout)
{
    var alertBox, alertContent, alertButton;

    if(!(alertBox = getID('alertBox',1)))
    {
        alertBox = document.createElement('div');
        alertBox.id = 'alertBox';
        alertBox.style.margin = 'auto';
        alertBox.style.padding = "5%";
        alertBox.style.height = '100vh';
        alertBox.style.width = '100vw';
        alertBox.style.verticalAlign = 'middle';
        alertBox.style.textAlign = 'center';
        document.body.appendChild(alertBox);
        getID('alertBox',1);
    }

    if(fontSize) alertBox.style.fontSize = fontSize;

    if(!(alertContent = getID('alertContent')))
    {
        alertContent = document.createElement('span');
        alertContent.id = 'alertContent';
        alertBox.appendChild(alertContent);
    }
    alertContent.innerHTML = alertMessage;

    if(!(alertButton = getID('alertButton')))
    {
        alertButton = document.createElement('button');
        alertButton.id = 'alertButton';
        alertButton.className = 'button';
        alertButton.style.margin = '0 auto';
        alertButton.style.lineHeight = '1.5em';
        alertButton.style.textAlign = 'center';
        alertButton.style.fontSize = '1.2em';
        alertBox.appendChild(alertButton);
    }
    if(alertButtonText && !timeout)
    {
        alertButton.style.width = (alertButtonText.length) + 'ch';
        alertButton.innerHTML = alertButtonText;
        alertButton.onclick = action;
        alertButton.style.display = 'block';
        showCursor('document.body');
    }
    else alertButton.style.display = 'none';

    if(timeout) setTimeout(action,timeout);

    showFrame(null);
    alertBox.style.display = 'table-cell';
}


function injectScript(url, id, callback)
{
    var script;
    var head = document.head || document.getElementsByTagName('head')[0];

    if (id && (script = document.getElementById(id)) !== null)
        script.parentNode.removeChild(script);

    script = document.createElement('script');
    script.type = 'text/javascript';
    if (id) script.id = id;

    if(callback)
    {
        if(script.addEventListener) script.addEventListener('load', callback, true);
        else if(script.readyState) script.onreadystatechange = callback;
    }

    script.src = url;
    head.appendChild(script);
}

function fixMobileOrientation(orientation)
{
    if('orientation' in window || 'orientation' in screen ||
       'mozOrientation' in screen || 'msOrientation' in screen)
    {
        if (orientation !== 'portrait' && orientation !== 'landscape')
            throw new TypeError("fixMobileOrientation: specify either 'portrait' or 'landscape'");

        var explanation = (orientation === "portrait") ? "upright" : "sideways";
        var message = "Please keep your device in " + orientation +
            " mode (" + explanation + ") for this test!";

        function checkOrientation()
        {
            var viewOrientation;
            if ('orientation' in window) // old specs
            {
                viewOrientation = (Math.abs(window.orientation) === 90) ? 'landscape'
                    : 'portrait';
            }
            else // new specs
            {
                if (screen.orientation) viewOrientation = screen.orientation.type;
                else viewOrientation = screen.mozOrientation || screen.msOrientation;
                viewOrientation = ~(viewOrientation.indexOf('landscape')) ? 'landscape'
                    : 'portrait';
            }

            if (viewOrientation !== orientation) alert(message);
        }

        if ('onorientationchange' in window)
            window.addEventListener("orientationchange", checkOrientation, true);
        else if ('orientation' in screen)
            screen.orientation.addEventListener("change", checkOrientation, true);
        else if ('onmsorientationchange' in screen)
            screen.addEventListener("MSOrientationChange", checkOrientation, true);
        else if ('onmozorientationchange' in screen)
            screen.addEventListener("mozorientationchange", checkOrientation, true);

        checkOrientation();
    }
}
var fixOrientation = fixMobileOrientation; // alias compatible with zen.js

function setMobileViewportScale(width,height)
{
    if('orientation' in window || 'orientation' in screen ||
        'mozOrientation' in screen || 'msOrientation' in screen)
    {
        var viewportMeta;

        if(!width || !height) throw new TypeError("setMobileViewportScale: dimensions not specified");

        viewportMeta = document.getElementsByTagName('meta')['viewport'];
        if(!viewportMeta)
        {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = "viewport";
            viewportMeta.id = "viewport";
            document.getElementsByTagName('head')[0].appendChild(viewportMeta);
        }

        function setScale()
        {
            var viewWidth, viewHeight, viewOrientation;
            var widthScale, heightScale, viewScale;
            var pageWidth;
            var metaContent;

            viewportMeta.content = "width=device-width, initial-scale=1";

            if('orientation' in window) // old specs
            {
                viewOrientation = (Math.abs(window.orientation) === 90) ? 'landscape'
                                                                        : 'portrait';
            }
            else // new specs
            {
                if(screen.orientation) viewOrientation = screen.orientation.type;
                else viewOrientation = screen.mozOrientation || screen.msOrientation;
                viewOrientation = ~(viewOrientation.indexOf('landscape')) ? 'landscape'
                                                                          : 'portrait';
            }

            if(viewOrientation === 'portrait')
            {
                viewWidth = Math.min(screen.width, screen.height);
                viewHeight = Math.max(screen.width, screen.height);
            }
            else if(viewOrientation === 'landscape')
            {
                viewWidth = Math.max(screen.width, screen.height);
                viewHeight = Math.min(screen.width, screen.height);
            }

            widthScale = viewWidth / width;
            heightScale = viewHeight / height;

            if(widthScale < heightScale)
            {
                viewScale = widthScale;
                pageWidth = width;
            }
            else
            {
                viewScale = heightScale;
                pageWidth = viewWidth / viewScale;
            }

            metaContent = "width=" + Math.round(pageWidth);
            metaContent += (", initial-scale=" + viewScale);
            metaContent += (", maximum-scale=" + viewScale);

            viewportMeta.content = metaContent;
        }

        setScale();

        if('onorientationchange' in window)
            window.addEventListener("orientationchange",setScale,true);
        else if('orientation' in screen)
            screen.orientation.addEventListener("change",setScale,true);
        else if('onmsorientationchange' in screen)
            screen.addEventListener("MSOrientationChange",setScale,true);
        else if('onmozorientationchange' in screen)
            screen.addEventListener("mozorientationchange",setScale,true);
    }
}

function showCursor(divId)
{
    if(divId === "document.body") document.body.style.cursor = "auto";
    else getID(divId).style.cursor = "auto";
}

function hideCursor(divId)
{
    if(divId === "document.body") document.body.style.cursor = "none";
    else getID(divId).style.cursor = "none";
}

function tmbSubmitToServer(tmbData,tmbScore,tmbOutcomes,tmbAction)
{
    var tmbForm, tmbFormData, tmbFormScore, tmbFormOutcomes;

    tmbAction = tmbAction ? tmbAction : '/run';

    if (document.createElement &&
        (tmbForm = document.createElement('FORM')) &&
        (tmbFormData = document.createElement('INPUT')) &&
        (tmbFormScore = document.createElement('INPUT')) &&
        (tmbFormOutcomes = document.createElement('INPUT')))
    {
        tmbForm.name = 'form';
        tmbForm.method = 'post';
        tmbForm.action = tmbAction;
        tmbForm.onsubmit = function() {return false};

        tmbFormData.type = 'hidden';
        tmbFormData.name = 'data';
        tmbFormData.value = JSON.stringify(tmbData);
        tmbForm.appendChild(tmbFormData);

        tmbFormScore.type = 'hidden';
        tmbFormScore.name = 'score';
        tmbFormScore.value = tmbScore;
        tmbForm.appendChild(tmbFormScore);

        tmbFormOutcomes.type = 'hidden';
        tmbFormOutcomes.name = 'outcomes';
        tmbFormOutcomes.value = JSON.stringify(tmbOutcomes);
        tmbForm.appendChild(tmbFormOutcomes);

        document.body.appendChild(tmbForm);
        tmbForm.submit();
    }
}

function tmbSubmitToURL(URL,tmbData)
{
    var tmbForm;

    if(tmbData === null || typeof tmbData !== 'object')
    {
        throw new TypeError("tmbSubmitToURL: 'tmbData' is not an object.");
    }

    if (document.createElement &&
        (tmbForm = document.createElement('FORM')))
    {
        tmbForm.name = 'form';
        tmbForm.method = 'post';
        tmbForm.action = URL;
        tmbForm.onsubmit = function() {return false;};

        for(var dataKey in tmbData)
        {
            if(tmbData.hasOwnProperty(dataKey))
            {
                var tmbFormData = document.createElement("INPUT");

                tmbFormData.type = 'hidden';
                tmbFormData.name = dataKey;
                tmbFormData.value = tmbData[dataKey];

                tmbForm.appendChild(tmbFormData);
            }
        }

        document.body.appendChild(tmbForm) ;
        tmbForm.submit();
        document.body.removeChild(tmbForm) ;
    }
}

function tmbSubmitToFile(tmbData, tmbFile, autoSave)
{
    var mykeys = [];
    var myvalues = "", mystring = "";
    var needToConfirm = true;

    for(var i=0; i<tmbData.length; i++)
    {
        for (var propertyName in tmbData[i])
        {
            if (tmbData[i].hasOwnProperty(propertyName) &&
                mykeys.indexOf(propertyName) === -1)
            {
                mykeys.push(propertyName);
                mystring += ('"' + propertyName + '"' + ",");
            }
        }
    }
    mystring=mystring.substring(0,mystring.length-1);
    mystring += '\r\n';

    for(i=0; i<tmbData.length; i++)
    {
        myvalues = "";

        for(var j=0; j<mykeys.length; j++)
        {
            if(!(typeof(tmbData[i][mykeys[j]]) === 'undefined' ||
                 tmbData[i][mykeys[j]] === null))
            {
                if(tmbData[i][mykeys[j]] instanceof Object)
                {
                    myvalues += ('"' + JSON.stringify(tmbData[i][mykeys[j]]).replace(/\"/g, '""') + '"');
                }
                else myvalues += ('"' + (tmbData[i][mykeys[j]]) + '"');
            }

            myvalues += ",";
        }
        myvalues=myvalues.substring(0,myvalues.length-1);
        mystring += myvalues + '\r\n';
    }

    if(autoSave)
    {
        needToConfirm = !saveTextAs(mystring,tmbFile); // in FileSaver.js
        
        try
        {
            if(!needToConfirm) alert("Data have been saved in " + tmbFile);
            else alert("Could not save the data!!");    
        }
        catch(err)
        {
            if(!needToConfirm) console.log("Data have been saved in " + tmbFile);
            else console.log("Could not save the data!!");
        }
    }

    try
    {
        var popResults = window.open("","",
                                     "width=500,height=500," +
                                     "menubar=yes,toolbar=yes,scrollbars=yes," +
                                     "status=yes,resizable=yes");

        if (popResults === null || typeof(popResults) === 'undefined')
        {
            throw new TypeError;
        }
    }
    catch(err)
    {
        alert("Could not open data window. " +
              "Try disabling popup blockers before closing this.");

        popResults = window.open("","",
                                 "width=500,height=500," +
                                 "menubar=yes,toolbar=yes,scrollbars=yes," +
                                 "status=yes,resizable=yes");
    }
    finally
    {
        if (popResults === null || typeof(popResults) === 'undefined')
        {
            alert("Tried again and failed opening data window.");
        }
        else
        {
            popResults.document.write('<pre>' + mystring + '</pre><br>');

            var filename = popResults.document.createElement("INPUT");
            filename.type = "text";
            filename.value = tmbFile;
            popResults.document.body.appendChild(filename);

            var button = popResults.document.createElement("BUTTON");
            var btext = popResults.document.createTextNode("Save");
            button.appendChild(btext);
            popResults.document.body.appendChild(button);

            popResults.onbeforeunload = function()
            {
                if(needToConfirm)
                {
                    return "Have you saved the data?";
                }
            };

            button.onclick = function()
            {
                tmbFile = filename.value;

                needToConfirm = !saveTextAs(mystring,tmbFile); // in FileSaver.js
                if(needToConfirm) alert("Could not save the data!!");
            };

            popResults.document.title = tmbFile;

            popResults.document.close();
        }
    }
}

function logResults(res, mode)
{
    if(!res || !res[0]) return;

    var log = '', propertyName, len = res.length;
    if(mode === 'cum' || (mode !== 'cum' && len === 1))
    {
        for (propertyName in res[0])
        {
            if(res[0].hasOwnProperty(propertyName))
                log += propertyName+' ';
        }
        console.log(log);
        log = '';
    }
    for(var i = (!mode || mode === 'inc') ? len-1 : 0; i < len; i++)
    {
        for(propertyName in res[i])
        {
            if(res[i].hasOwnProperty(propertyName))
                log += (res[i][propertyName] + ' ');
        }
        log += '\n';
    }

    console.log(log);
}


function getUrlParameters(parameter, staticURL, decode)
{
    var currLocation, parArr, parr, returnBool;

    currLocation = (staticURL.length) ? staticURL : window.location.search;

    if(!currLocation) return false;

    parArr = currLocation.split("?")[1].split("&");

    returnBool = true;

    for(var i = 0; i < parArr.length; i++)
    {
        parr = parArr[i].split("=");

        if(parr[0] === parameter)
        {
            returnBool = true;
            return (decode) ? decodeURIComponent(parr[1]) : parr[1];
        }
        else returnBool = false;
    }

    if(!returnBool) return false;
}

function urlEncode(str)
{
    str = (str + '').toString();

    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
}

function httpBuildQuery(formData, numericPrefix, argSeparator)
{

    var value, key, tmp = [], that = this;

    var httpBuilQueryHelper = function(key, val, argSeparator)
    {
        var k, tmp = [];

        if (val === true) val = '1';
        else if (val === false) val = '0';

        if (val !== null)
        {
            if (typeof val === 'object')
            {
                for (k in val)
                {
                    if (val[k] !== null && val.hasOwnProperty(k))
                        tmp.push(httpBuilQueryHelper(key + '[' + k + ']', val[k], argSeparator));
                }
                return tmp.join(argSeparator);
            }
            else if (typeof val !== 'function')
                return that.urlEncode(key) + '=' + that.urlEncode(val);
            else throw new Error('There was an error processing for http_build_query().');
        }
        else return '';
    };

    if (!argSeparator) argSeparator = '&';

    for (key in formData)
    {
        if(formData.hasOwnProperty(key))
        {
            value = formData[key];
            if (numericPrefix && !isNaN(key))
                key = String(numericPrefix) + key;

            var query = httpBuilQueryHelper(key, value, argSeparator);
            if (query !== '') tmp.push(query);
        }
    }

    return tmp.join(argSeparator);
}

function ajaxRequest(params)
{
    var request, message, query, responseHeader, response;

    var ajaxOptions = {url: ".",
                       method: "GET",
                       data: null,
                       async: true,
                       timeout: 10000,
                       user: null,
                       pass: null,
                       getHeaders: false,
                       sendCredentials: false,
                       callback: null
                      };

    if (null !== params && "object" === typeof params)
    {
        if(params.hasOwnProperty("url")) ajaxOptions.url = params.url;
        if(params.hasOwnProperty("method")) ajaxOptions.method = params.method.toUpperCase();
        if(params.hasOwnProperty("data")) ajaxOptions.data = params.data;
        if(params.hasOwnProperty("async")) ajaxOptions.async = params.async;
        if(params.hasOwnProperty("timeout")) ajaxOptions.timeout = params.timeout;
        if(params.hasOwnProperty("user")) ajaxOptions.user = params.user;
        if(params.hasOwnProperty("pass")) ajaxOptions.pass = params.pass;
        if(params.hasOwnProperty("getHeaders")) ajaxOptions.getHeaders = params.getHeaders;
        if(params.hasOwnProperty("sendCredentials")) ajaxOptions.sendCredentials = params.sendCredentials;
        if(params.hasOwnProperty("callback")) ajaxOptions.callback = params.callback;
    }

    if(ajaxOptions.data !== null)
    {
        query = httpBuildQuery(ajaxOptions.data);

        if(ajaxOptions.method === "GET")
            ajaxOptions.url += ("?" + query);
    }

    request = new XMLHttpRequest();

    try
    {
        request.open(ajaxOptions.method, ajaxOptions.url, ajaxOptions.async);

        if(ajaxOptions.async)
        {
            if(request.timeout !== undefined && request.ontimeout !== undefined)
            {
                request.timeout = ajaxOptions.timeout;

                request.ontimeout = function()
                {
                    console.log("ajaxRequest timed out.");
                }
            }

            if(request.withCredentials !== undefined && ajaxOptions.sendCredentials)
                request.withCredentials = true;

            request.onreadystatechange = function()
            {
                if(ajaxOptions.getHeaders && request.readyState === 2)
                {
                    responseHeader = request.getAllResponseHeaders();
                    console.log("Request Status: " +
                                request.status + " " + request.statusText);
                    if(responseHeader) console.log(responseHeader);
                }

                if(request.readyState === 4)
                {
                    if(request.status >= 200 && request.status < 400)
                    {
                        response = request.response !== undefined ?
                                   request.response :
                                   request.responseText;

                        if(ajaxOptions.callback !== null) ajaxOptions.callback(response);
                        else return response;
                    }
                    else
                    {
                        message = "Error in ajaxRequest: " +
                                  request.status + " " +
                                  request.statusText;

                        console.log(message);

                        if(ajaxOptions.callback !== null) ajaxOptions.callback(null);
                        else return null;
                    }
                }
            }
        }

        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        if(ajaxOptions.user && ajaxOptions.pass)
        {
            request.setRequestHeader("Authorization",
                                     "Basic "+btoa(ajaxOptions.user+":"+ajaxOptions.pass));
        }

        if(ajaxOptions.method === "POST")
        {
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
    }
    catch(error)
    {
        message = "Error in ajaxRequest 'open': " + error.message;
        console.log(message);

        if(ajaxOptions.callback !== null) ajaxOptions.callback(null);
        else return null;
    }

    try
    {
        if(ajaxOptions.method === "POST") request.send(query);
        else request.send();
    }
    catch(error)
    {
        message = "Error in ajaxRequest 'send': " + error.message;
        console.log(message);
        if(ajaxOptions.callback !== null) ajaxOptions.callback(null);
        else return null;
    }

    if(!ajaxOptions.async)
    {
        if(ajaxOptions.getHeaders)
        {
            responseHeader = request.getAllResponseHeaders();
            console.log("Request Status: " +
                        request.status + " " + request.statusText);
            if(responseHeader) console.log(responseHeader);
        }

        if(request.status >= 200 && request.status < 400)
        {
            // fix for ie < 10: response is not defined
            response = request.response !== undefined ?
                       request.response :
                       request.responseText;
            if(ajaxOptions.callback !== null) ajaxOptions.callback(response);
            else return (response);
        }
        else
        {
            message = "Error in ajaxRequest: " +
                      request.status + " " + request.statusText;
            console.log(message);

            if(ajaxOptions.callback !== null) ajaxOptions.callback(null);
            else return null;
        }
    }
}

function imagePreLoad(imgs,args)
{
    var resources = imgs.slice();

    var imgsLoaded = 0;

    var loadOptions = {progress: true,
                       pipeline: true,
                       copy: true,
                       callBack: null};

    if(tmbObjs.images === undefined) tmbObjs.images = [];

    if (null !== args && "object" === typeof args)
    {
        if(args.hasOwnProperty("progress")) loadOptions.progress = args.progress;
        if(args.hasOwnProperty("pipeline")) loadOptions.pipeline = args.pipeline;
        if(args.hasOwnProperty("copy")) loadOptions.copy = args.copy;
        if(args.hasOwnProperty("callBack")) loadOptions.callBack = args.callBack;
    }

    var requests = loadOptions.pipeline ? 1 : resources.length;

    var progDiv, progDivInfo, progDivCount, progDivBar;

    if(loadOptions.progress)
    {

        progDiv = document.createElement("div");
        progDivInfo = document.createElement("span");
        progDivCount = document.createElement("span");
        progDivBar = document.createElement("progress");

        progDiv.id = "_preloadDiv";
        progDiv.style.textAlign = "center";
        progDiv.style.position = "absolute";
        progDiv.style.left = "50%";
        progDiv.style.top = "50%";
        progDiv.style.marginTop = "-30px";
        progDiv.style.marginLeft = "-150px";

        progDivInfo.id = '_preloadText';
        progDivInfo.style.textAlign = "center";
        progDivInfo.innerHTML = "Loading resources: ";

        progDivCount.id = '_preloadCount';
        progDivCount.style.textAlign = "center";
        progDivCount.innerHTML = "0 / " + imgs.length + "<br>";

        progDiv.appendChild(progDivInfo);
        progDiv.appendChild(progDivCount);

        if(progDivBar && progDivBar.max !== undefined)
        {
            progDivBar.id = "_preloadBar";
            progDivBar.style.width = "300px";
            progDivBar.style.height = "30px";
            progDivBar.max = 1;
            progDivBar.value = 0;
            progDiv.appendChild(progDivBar);
        }

        document.body.appendChild(progDiv);
        progDiv.style.display = "block";
    }

    var processImage = function(e)
    {
        var imgEl = e.target;

        imgsLoaded++;

        e.preventDefault();
        e.stopPropagation();

        imgEl.removeEventListener("load",processImage,true);
        imgEl.removeEventListener("error",processImage,true);

        if(e.type === "error")
        {
            console.log("Error pre-loading image: " + imgEl.src);
        }

        if(loadOptions.progress)
        {
            progDivCount.innerHTML = imgsLoaded + " / " + imgs.length + "<br>";
            if(progDivBar && progDivBar.max !== undefined)
                progDivBar.value = imgsLoaded / imgs.length;
        }

        if(loadOptions.copy) tmbObjs.images.push(imgEl);

        if(loadOptions.pipeline && imgsLoaded < imgs.length)
        {
            loadImage(resources.shift());
        }

        if(imgsLoaded === imgs.length)
        {
            if(loadOptions.progress) document.body.removeChild(progDiv);
            if(loadOptions.callBack) loadOptions.callBack();
        }
    };

    var loadImage = function (imgSrc)
    {
        var image = new Image();

        image.addEventListener("load",processImage,true);
        image.addEventListener("error",processImage,true);

        image.id = imgSrc;
        image.src = imgSrc;
    };

    while(requests > 0)
    {
        requests--;
        loadImage(resources.shift());
    }
}

function chooseInput(inputTypes,callback)
        {
            var msg = '', errMsg = '&nbsp', oldAction = '';

            if(inputTypes === null || typeof inputTypes !== 'object')
                throw new TypeError("chooseInput: missing or invalid inputTypes object.");

            function getinput(e)
            {
                var input;
                errMsg = '';

                e.preventDefault();
                e.stopPropagation();

                if(e.type === 'keydown')
                {
                    if(inputTypes.keyboard) input = 'keys';
                    else errMsg = "Keyboard";
                }
                else if(e.type === 'pointerdown' || e.type === 'MSPointerDown')
                {
                    if(e.pointerType === 'touch' || e.pointerType === e.MSPOINTER_TYPE_TOUCH)
                    {
                        if(inputTypes.touch) input = 'taps';
                        else errMsg = "Touch";
                    }
                    else if(e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)
                    {
                        if(inputTypes.mouse) input = 'clicks';
                        else errMsg = "Mouse/Trackpad";
                    }
                    else if(e.pointerType === 'pen' || e.pointerType === e.MSPOINTER_TYPE_PEN)
                    {
                        if(inputTypes.touch) input = 'taps';
                        else errMsg = "Pen";
                    }
                }
                else if(e.type === 'touchstart')
                {
                    if(inputTypes.touch) input = 'taps';
                    else errMsg = "Touch";
                }
                else if(e.type === 'mousedown')
                {
                    if(inputTypes.mouse) input = 'clicks';
                    else errMsg = "Mouse/Trackpad";
                }

                if(errMsg) errMsg += " not valid for this test: try another input.";
                document.getElementById('errMsg').innerHTML = errMsg;

                if(input)
                {
                    document.body.removeEventListener("keydown",getinput,true);
                    if(hasTouch) document.body.removeEventListener("touchstart",getinput,true);
                    document.body.removeEventListener("mousedown",getinput,true);
                    if(hasPointer)
                    {
                        if(window.PointerEvent) document.body.removeEventListener("pointerdown",getinput,true);
                        else if(window.MSPointerEvent) document.body.removeEventListener("MSPointerDown",getinput,true);
                    }

                    if('touchAction' in document.body.style) document.body.style.touchAction = oldAction;
                    else if ('msTouchAction' in document.body.style) document.body.style.msTouchAction = oldAction;

                    document.getElementById('centeredTable').remove();

                    if(callback) callback(input);
                }
            }

            msg += "<h3>Please choose how you will respond in this test:</h3>";
            if(inputTypes.keyboard)
                msg += "- To use a <b>keyboard</b>, <b>press any key</b> now.<br><br>";
            if(inputTypes.mouse)
                msg += "- To use a <b>mouse</b> or <b>track pad</b>, <b>click</b> now.<br><br>";
            if(inputTypes.touch)
                msg += "- To use a <b>touch screen</b>, <b>touch the screen</b> now.<br><br>";

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

    document.body.addEventListener("keydown",getinput,true);
    document.body.addEventListener("mousedown",getinput,true);
    if(hasTouch) document.body.addEventListener("touchstart",getinput,true);
    if(hasPointer)
    {
        if(window.PointerEvent) document.body.addEventListener("pointerdown",getinput,true);
        else if(window.MSPointerEvent) document.body.addEventListener("MSPointerDown",getinput,true);
    }

    document.body.innerHTML += "<div id='centeredTable' style='box-sizing: border-box; display: table; margin: auto; height: 100vh; width: 100vw; padding: 0 5% 0 5%; text-align: center; font-family: \"Helvetica Neue\",Helvetica,Arial,sans-serif;'>" +
                               "<div style='display: table-cell; vertical-align: middle; text-align: center;'>" +
                               "<div id='chooseInput' style='margin: auto; max-width: 450px; border: solid 2px #f1c40f; border-radius: 1em; background: #f7f7f7; padding: 10px; text-align:left; font-size: 13pt;'>" +
                               msg +
                               "<span id='errMsg' style='color: red;'>" + errMsg + "</span>" +
                               "</div></div></div>";
}

var tmbUI = {UIevents: [],
             UIkeys: [],
             UIelements: [],
             highlight: "",
             timeout: 10000,
             timeoutRef: 0,
             onreadyUI: function (){},
             getInput: function (){},
             status: "",
             message: "",
             response: "",
             downTimestamp: 0,
             rt: 0,
             upTimestamp: 0,
             dwell: 0
};

tmbUI.getInput = function ()
{
    var i, timeStamp = now(), downDebounce = false, highlightEl,
        elBorder, elStroke, elStrokeWidth, errorMessage = "";

    for (var key in tmbUI)
    {
        if (tmbUI.hasOwnProperty(key))
        {
            switch(key)
            {
                case "UIevents":
                    if(tmbUI.UIevents.length === 0)
                        errorMessage += "Must specify UIevents: " +
                                        "'keys', 'clicks' or 'taps'. ";
                    if(!(tmbUI.UIevents instanceof Array))
                        tmbUI.UIevents = [tmbUI.UIevents];
                    for(i = 0; i < tmbUI.UIevents.length; i++)
                    {
                        if(!["keys","clicks","taps"].includes(tmbUI.UIevents[i]))
                            errorMessage += "'" + tmbUI.UIevents[i] +
                                            "' is not a valid event. ";
                    }
                    if(tmbUI.UIevents.includes("taps") && !hasTouch && !hasPointer)
                        errorMessage += "'taps' is not a valid event. ";
                    break;
                case "UIkeys":
                    if(!(tmbUI.UIkeys instanceof Array))
                        tmbUI.UIkeys = [tmbUI.UIkeys];
                    for(i = 0; i<tmbUI.UIkeys.length; i++)
                    {
                        if(!keyboardCodes[tmbUI.UIkeys[i]])
                            errorMessage += "'" + tmbUI.UIkeys[i] +
                                            "' is not a valid keyboard code. ";
                    }
                    break;
                case "UIelements":
                    if(!(tmbUI.UIelements instanceof Array))
                        tmbUI.UIelements = [tmbUI.UIelements];
                    for (i = 0; i< tmbUI.UIelements.length; i++)
                    {
                        if(!getID(tmbUI.UIelements[i]))
                            errorMessage += "'" + tmbUI.UIelements[i] +
                                            "' is not a valid element. ";
                    }
                    break;
                case "timeout":
                    if(tmbUI.timeout < 150)
                        errorMessage += "Timeout is " +
                                        tmbUI.timeout + " ms, " +
                                        "must be > 150 ms. ";
                    break;
                case "timeoutRef":
                    if(tmbUI.timeoutRef !== 0)
                    {
                        tmbUI.message += "'getInput' called again while " +
                                         "still busy. ";
                        return false;
                    }
                    break;
                case "highlight":
                    if(tmbUI.highlight !== "")
                    {
                        var testDiv = document.createElement("div");
                        testDiv.style.color = "rgb(0, 0, 0)";
                        testDiv.style.color = tmbUI.highlight;
                        if (testDiv.style.color === "rgb(0, 0, 0)")
                        {
                            testDiv.style.color = "rgb(255, 255, 255)";
                            testDiv.style.color = tmbUI.highlight;
                            if(testDiv.style.color === "rgb(255, 255, 255)")
                                errorMessage += "'highlight' must be " +
                                                "empty string or valid CSS color. ";
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

    if((tmbUI.UIkeys.length > 0) && !tmbUI.UIevents.includes("keys"))
        errorMessage += "Need 'keys' in UIevents for valid keys. ";
    if(tmbUI.UIkeys.length &&
        tmbUI.UIelements.length &&
        (tmbUI.UIelements.length < tmbUI.UIkeys.length))
        errorMessage += "Invalid number of UIelements, " +
                        "more 'keys' than 'UIelements'. ";
    if(tmbUI.UIelements.length === 0 && tmbUI.highlight !== "")
        errorMessage += "No elements to highlight. ";

    if(errorMessage)
    {
        tmbUI.status = "error";
        tmbUI.message = errorMessage;

        var readyUI = new CustomEvent("readyUI");
        document.addEventListener("readyUI", tmbUI.onreadyUI, true);
        document.dispatchEvent(readyUI);
        document.removeEventListener("readyUI", tmbUI.onreadyUI, true);

        return false;
    }

    function downResponseHandler(e)
    {
        var responseEvent, r;

        responseEvent = e ;//|| window.event;

        responseEvent.preventDefault();
        responseEvent.stopPropagation();

        if (downDebounce === false)
        {
            if(tmbUI.UIevents.includes("keys") && responseEvent.type === "keydown")
            {
                r = responseEvent.charCode || responseEvent.keyCode;

                if(tmbUI.UIkeys.includes(r) || tmbUI.UIkeys.length === 0)
                {
                    tmbUI.response = codeToKey(r);

                    if(tmbUI.highlight!=="" && tmbUI.UIkeys.length > 0)
                        highlightEl = getID(tmbUI.UIelements[tmbUI.UIkeys.indexOf(r)]);

                    downDebounce = true;
                }
            }
            if(tmbUI.UIevents.includes("clicks"))
            {
                if(responseEvent.type === "mousedown" ||
                   (responseEvent.type === "pointerdown" &&
                       responseEvent.pointerType === 'mouse') ||
                   (responseEvent.type === "MSPointerDown" &&
                       responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_MOUSE))
                {
                    if(tmbUI.UIelements.length === 0) tmbUI.response = "document";
                    else tmbUI.response = responseEvent.target ? responseEvent.target.id
                                                               : responseEvent.srcElement.id;

                    if(tmbUI.highlight!=="")
                        highlightEl = getID(tmbUI.response);

                    downDebounce = true;
                }
            }
            if(tmbUI.UIevents.includes("taps"))
            {
                if(responseEvent.type === "touchstart" ||
                    (responseEvent.type === "pointerdown" &&
                        (responseEvent.pointerType === 'touch' ||
                         responseEvent.pointerType === 'pen')) ||
                    (responseEvent.type === "MSPointerDown" &&
                        (responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_TOUCH ||
                         responseEvent.pointerType === responseEvent.MSPOINTER_TYPE_PEN)))
                {
                    if(tmbUI.UIelements.length === 0) tmbUI.response = "document";
                    else tmbUI.response = responseEvent.target ? responseEvent.target.id
                                                               : responseEvent.srcElement.id;

                    if(tmbUI.highlight!=="")
                        highlightEl = getID(tmbUI.response);

                    downDebounce = true;
                }

            }

            if(downDebounce === true)
            {
                tmbUI.rt = timeStamp;
                timeStamp = now();
                tmbUI.rt = timeStamp - tmbUI.rt;
                tmbUI.rt = tmbUI.rt.round(2);
                tmbUI.downTimestamp = timeStamp;

                if(tmbUI.timeoutRef) clearTimeout(tmbUI.timeoutRef);

                if(highlightEl)
                {
                    if(['div','span','button','p',
                        'img'].includes(highlightEl.tagName.toLowerCase()))
                    {
                        elBorder = highlightEl.style.border;
                        highlightEl.style.border = "5px solid " + tmbUI.highlight; //#99ccff";
                    }
                    else if(['circle','rect','ellipse','line',
                             'path','polygon','polyline','image',
                             'text'].includes(highlightEl.tagName.toLowerCase()))
                    {
                        elStroke = highlightEl.style.stroke;
                        elStrokeWidth = highlightEl.style.strokeWidth;
                        highlightEl.style.stroke = tmbUI.highlight;
                        highlightEl.style.strokeWidth = 5;
                    }
                    else if(["shape"].includes(highlightEl.tagName.toLowerCase()))
                    {
                        elStroke = highlightEl.strokecolor;
                        elStrokeWidth = highlightEl.strokeweight;
                        highlightEl.strokecolor = tmbUI.highlight;
                        highlightEl.strokeweight = 5;
                    }
                }
            }

        }
    }

    function upResponseHandler(e)
    {
        var responseEvent;
        var MSetypes = ['','', 'touch', 'pen', 'mouse'];

        responseEvent = e;// || window.event;

        responseEvent.preventDefault();
        responseEvent.stopPropagation();

        if(downDebounce === true)
        {
            tmbUI.upTimestamp = now();
            tmbUI.dwell = tmbUI.upTimestamp - timeStamp;
            tmbUI.dwell = tmbUI.dwell.round(2);

            tmbUI.status = responseEvent.type;
            if(responseEvent.type === "pointerup")
                tmbUI.status += ("-" + responseEvent.pointerType);
            else if(responseEvent.type === "MSPointerUp")
                tmbUI.status += ("-" + MSetypes[responseEvent.pointerType]);

            removeHandlers();
            returnHandler();
        }
    }

    function installHandlers()
    {
        if(tmbUI.UIevents.includes("keys"))
        {
            document.addEventListener("keydown",downResponseHandler,true);
            document.addEventListener("keyup",upResponseHandler,true);
        }
        if(tmbUI.UIevents.includes("clicks"))
        {
            if(tmbUI.UIelements.length === 0)
            {
                if(window.PointerEvent)
                {
                    document.body.addEventListener("pointerdown",downResponseHandler,true);
                    document.body.addEventListener("pointerup",upResponseHandler,true);
                }
                else if(window.MSPointerEvent) // IE10
                {
                    document.body.addEventListener("MSPointerDown",downResponseHandler,true);
                    document.body.addEventListener("MSPointerUp",upResponseHandler,true);
                }
                else
                {
                    document.addEventListener("mousedown",downResponseHandler,true);
                    document.addEventListener("mouseup",upResponseHandler,true);
                }
            }
            else for(i = 0; i < tmbUI.UIelements.length; i++)
            {
                if(window.PointerEvent)
                {
                    getID(tmbUI.UIelements[i]).addEventListener("pointerdown",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).addEventListener("pointerup",upResponseHandler,true);
                }
                else if(window.MSPointerEvent) // IE10
                {
                    getID(tmbUI.UIelements[i]).addEventListener("MSPointerDown",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).addEventListener("MSPointerUp",upResponseHandler,true);
                }
                else
                {
                    getID(tmbUI.UIelements[i]).addEventListener("mousedown",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).addEventListener("mouseup",upResponseHandler,true);
                }
            }
        }
        if(tmbUI.UIevents.includes("taps"))
        {
            if(tmbUI.UIelements.length === 0)
            {
                if(window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                {
                    document.addEventListener("pointerdown", downResponseHandler, true);
                    document.addEventListener("pointerup", upResponseHandler, true);
                }
                else if(window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                {
                    document.addEventListener("MSPointerDown", downResponseHandler, true);
                    document.addEventListener("MSPointerUp", upResponseHandler, true);
                }
                else if(hasTouch && !hasPointer)
                {
                    document.addEventListener("touchstart",downResponseHandler,true);
                    document.addEventListener("touchend",upResponseHandler,true);
                }
            }
            else for(i = 0; i < tmbUI.UIelements.length; i++)
            {
                if(window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                {
                    getID(tmbUI.UIelements[i]).addEventListener("pointerdown", downResponseHandler, true);
                    getID(tmbUI.UIelements[i]).addEventListener("pointerup", upResponseHandler, true);
                }
                else if(window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                {
                    getID(tmbUI.UIelements[i]).addEventListener("MSPointerDown", downResponseHandler, true);
                    getID(tmbUI.UIelements[i]).addEventListener("MSPointerUp", upResponseHandler, true);
                }
                else if(hasTouch && !hasPointer)
                {
                    getID(tmbUI.UIelements[i]).addEventListener("touchstart",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).addEventListener("touchend",upResponseHandler,true);
                }
            }
        }
    }

    function removeHandlers()
    {
        if(tmbUI.UIevents.includes("keys"))
        {
            document.removeEventListener("keydown",downResponseHandler,true);
            document.removeEventListener("keyup",upResponseHandler,true);
        }
        if(tmbUI.UIevents.includes("clicks"))
        {
            if(tmbUI.UIelements.length === 0)
            {
                if(window.PointerEvent)
                {
                    document.body.removeEventListener("pointerdown",downResponseHandler,true);
                    document.body.removeEventListener("pointerup",upResponseHandler,true);
                }
                else if(window.MSPointerEvent) // IE10
                {
                    document.body.removeEventListener("MSPointerDown",downResponseHandler,true);
                    document.body.removeEventListener("MSPointerUp",upResponseHandler,true);
                }
                else
                {
                    document.removeEventListener("mousedown",downResponseHandler,true);
                    document.removeEventListener("mouseup",upResponseHandler,true);
                }
            }
            else for(i = 0; i < tmbUI.UIelements.length; i++)
            {
                if(window.PointerEvent)
                {
                    getID(tmbUI.UIelements[i]).removeEventListener("pointerdown",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).removeEventListener("pointerup",upResponseHandler,true);
                }
                else if(window.MSPointerEvent) // IE10
                {
                    getID(tmbUI.UIelements[i]).removeEventListener("MSPointerDown",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).removeEventListener("MSPointerUp",upResponseHandler,true);
                }
                else
                {
                    getID(tmbUI.UIelements[i]).removeEventListener("mousedown",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).removeEventListener("mouseup",upResponseHandler,true);
                }
            }
        }
        if(tmbUI.UIevents.includes("taps"))
        {
            if(tmbUI.UIelements.length === 0)
            {
                if(window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                {
                    document.removeEventListener("pointerdown", downResponseHandler, true);
                    document.removeEventListener("pointerup", upResponseHandler, true);
                }
                else if(window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                {
                    document.removeEventListener("MSPointerDown", downResponseHandler, true);
                    document.removeEventListener("MSPointerUp", upResponseHandler, true);
                }
                else if(hasTouch && !hasPointer)
                {
                    document.removeEventListener("touchstart",downResponseHandler,true);
                    document.removeEventListener("touchend",upResponseHandler,true);
                }
            }
            else for(i = 0; i < tmbUI.UIelements.length; i++)
            {
                if(window.PointerEvent && !tmbUI.UIevents.includes("clicks"))
                {
                    getID(tmbUI.UIelements[i]).removeEventListener("pointerdown", downResponseHandler, true);
                    getID(tmbUI.UIelements[i]).removeEventListener("pointerup", upResponseHandler, true);
                }
                else if(window.MSPointerEvent && !tmbUI.UIevents.includes("clicks")) // IE10
                {
                    getID(tmbUI.UIelements[i]).removeEventListener("MSPointerDown", downResponseHandler, true);
                    getID(tmbUI.UIelements[i]).removeEventListener("MSPointerUp", upResponseHandler, true);
                }
                else if(hasTouch && !hasPointer)
                {
                    getID(tmbUI.UIelements[i]).removeEventListener("touchstart",downResponseHandler,true);
                    getID(tmbUI.UIelements[i]).removeEventListener("touchend",upResponseHandler,true);
                }
            }
        }
    }

    function returnHandler()
    {
        if(tmbUI.timeoutRef)
        {
            clearTimeout(tmbUI.timeoutRef);
            tmbUI.timeoutRef = 0;
        }

        if(highlightEl)
        {
            setTimeout(function()
            {
                if(['div','span','button','p','img'].includes(highlightEl.tagName.toLowerCase()))
                    highlightEl.style.border = elBorder;
                else if(['circle','rect','ellipse','line',
                        'path','polygon','polyline','image',
                        'text'].includes(highlightEl.tagName.toLowerCase()))
                {
                    highlightEl.style.stroke = elStroke;
                    highlightEl.style.strokeWidth = elStrokeWidth;
                }
                else if(["shape"].includes(highlightEl.tagName.toLowerCase()))
                {
                    highlightEl.strokecolor = elStroke;
                    highlightEl.strokeweight = elStrokeWidth;
                }

                var readyUI = new CustomEvent("readyUI");
                document.addEventListener("readyUI", tmbUI.onreadyUI, true);
                document.dispatchEvent(readyUI);
                document.removeEventListener("readyUI", tmbUI.onreadyUI, true);
            },250);
        }
        else
        {
            var readyUI = new CustomEvent("readyUI");
            document.addEventListener("readyUI", tmbUI.onreadyUI, true);
            document.dispatchEvent(readyUI);
            document.removeEventListener("readyUI", tmbUI.onreadyUI, true);
        }
    }

    tmbUI.timeoutRef = setTimeout(function()
    {
        tmbUI.status = "timeout";
        tmbUI.message += "Timeout: no response in " + tmbUI.timeout + " ms.";
        removeHandlers();
        returnHandler();
    },tmbUI.timeout);

    installHandlers();

    return false;
};

function getKeyboardInput(acceptedKeys, fun, state, duration)
{
    if (!(acceptedKeys['highlight'] === true || acceptedKeys instanceof Array
        || acceptedKeys === "any"))
        throw new TypeError("getKeyboardInput: invalid acceptedKeys parameter");

    var highlight = (acceptedKeys['highlight'] === true) ? true : false;

    if (duration) setTimeout(disableKeyboard, duration);
    var startTime = now();

    var keyPressedDown = null;
    var responseTime = 0;

    var clearKeyboardInput = function ()
    {
        keyPressedDown = null;
        if (highlight)
        {
            for (var key in acceptedKeys)
            {
                if (acceptedKeys.hasOwnProperty(key) && key !== "highlight")
                    acceptedKeys[key].style.border = "5px solid transparent";
            }
        }
    };

    document.onkeydown = function (e)
    {
        responseTime = now() - startTime;
        var e = e || window.event;

        var v = e.charCode || e.keyCode;
        var value = codeToKey(v);

        if (acceptedKeys === "any" ||
            (highlight && value in acceptedKeys) ||
            ((acceptedKeys instanceof Array) && acceptedKeys.includes(value)))
        {
            if (!keyPressedDown || keyPressedDown === value)
            {
                keyPressedDown = value;

                if (highlight && acceptedKeys[value])
                    acceptedKeys[value].style.border = "5px solid #afd6fd";
            }
            else
            {
                clearKeyboardInput();
                alert("Please press only one key!\n\n" +
                      "Your response was not recorded. Please try again.");
                clearKeyboardInput();
            }
        }

        return false;
    };

    document.onkeyup = function(e)
    {
        var e = e || window.event;

        var v = e.charCode || e.keyCode;
        var value = codeToKey(v);

        if (acceptedKeys === "any" || (highlight && value in acceptedKeys) ||
            ((acceptedKeys instanceof Array) && acceptedKeys.contains(value)))
        {

            if (e.preventDefault)
            {
                e.preventDefault();
                e.stopPropagation();
            }
            else
            {
                e.returnValue = false;
                e.cancelBubble = true;
            }

            var event_handler_helper = function ()
            {
                if (value !== keyPressedDown)
                    return false;

                if (highlight)
                    acceptedKeys[value].style.border = "5px solid transparent";

                var input = {response: value, rt: responseTime};

                clearKeyboardInput();

                if (state)
                    fun(input, state);
                else
                    fun(input);

                return false;
            };

            if (highlight)
                window.setTimeout(event_handler_helper, 300);
            else
                event_handler_helper();
        }
    };

    return false;
}

var simulateMobileMouse = function (el)
{
    el.addEventListener("touchstart", mobileTouchHandler);
    el.addEventListener("touchmove", mobileTouchHandler);
    el.addEventListener("touchend", mobileTouchHandler);
    el.addEventListener("touchcancel", mobileTouchHandler);
};

var mobileTouchHandler = function (ev)
{
    ev.preventDefault();

    switch (ev.type)
    {
        case 'touchstart':
            if (ev.changedTouches.length !== 1) return;
            this.touchMoved = false;
            simulateMobileMouseEvent(ev, 'mouseover');
            simulateMobileMouseEvent(ev, 'mousemove');
            simulateMobileMouseEvent(ev, 'mousedown');
            break;
        case 'touchmove':
            if (ev.changedTouches.length !== 1) return;
            this.touchMoved = true;
            simulateMobileMouseEvent(ev, 'mousemove');
            break;
        case 'touchend':
            if (ev.changedTouches.length !== 1) return;
            simulateMobileMouseEvent(ev, 'mouseup');
            simulateMobileMouseEvent(ev, 'mouseout');
            if (!this.touchMoved) simulateMobileMouseEvent(ev, 'click');
            break;
        default:
            return;
    }
};

function simulateMobileMouseEvent(event, type)
{
    var mouse_ev = document.createEvent("MouseEvents");

    var touch = event.changedTouches[0];

    mouse_ev.initMouseEvent(
        type, // type of event
        true, // can bubble?
        true, // cancelable?
        window, // event view
        1, // mouse click count
        touch.screenX, // event's screen x-coordinate
        touch.screenY, // event's screen y-coordinate
        touch.clientX, // event's client x-coordinate
        touch.clientY, // event's client y-coordinate
        event.ctrlKey, // control key was pressed?
        event.altKey, // alt key was pressed?
        event.shiftKey, // shift key was pressed?
        event.metaKey, // meta key was pressed?
        0, // mouse button
        null // related target
    );

    event.target.dispatchEvent(mouse_ev);
}

function simulateKeyEvent(keyevent,keycode)
{
    var customKeyEvent  = null;

    if (document.createEvent)
    {
        try
        {
            customKeyEvent = document.createEvent("KeyEvents");

            customKeyEvent.initKeyEvent(keyevent,   // type of event
                true,       // can bubble?
                true,       // cancelable?
                window,     // event view
                false,      // includes CTRl key?
                false,      // includes ALT key?
                false,      // includes SHIFT key?
                false,      // includes META key?
                keycode,    // keycode
                0);   // charcode
        }
        catch (ex) /*:Error*/
        {
            try
            {
                customKeyEvent = document.createEvent("Events");
            }
            catch (uierror)/*:Error*/
            {
                customKeyEvent = document.createEvent("UIEvents");
            }
            finally
            {
                customKeyEvent.initEvent(keyevent,     // type of event
                    true,         // can bubble?
                    true);        // cancelable?
                customKeyEvent.view = window;
                customKeyEvent.altKey = false;
                customKeyEvent.ctrlKey = false;
                customKeyEvent.shiftKey = false;
                customKeyEvent.metaKey = false;
                customKeyEvent.keyCode = keycode;
                customKeyEvent.charCode = 0;
            }
        }
        document.dispatchEvent(customKeyEvent);
    }
    else if (document.createEventObject) //IE
    {
        customKeyEvent = document.createEventObject();

        customKeyEvent.bubbles = true;
        customKeyEvent.cancelable = true;
        customKeyEvent.view = window;
        customKeyEvent.ctrlKey = false;
        customKeyEvent.altKey = false;
        customKeyEvent.shiftKey = false;
        customKeyEvent.metaKey = false;
        customKeyEvent.keyCode = keycode;

        document.fireEvent("on" + keyevent, customKeyEvent);
    }
    else
    {
        throw("simulateKeyEvent(): No event simulation framework present.");
    }
}

var keyboardCodes =
{
    8: 'backspace',9: 'tab',13: 'enter',16: 'shift',17: 'control',18: 'alt',
    19: 'pause',20: 'capslock',27: 'escape',32: 'space',
    33: 'pageup',34: 'pagedown',35: 'end',36: 'home',
    37: 'left',38: 'up',39: 'right',40: 'down',45: 'insert',46: 'delete',
    48: '0',49: '1',50: '2',51: '3',52: '4',53: '5',
    54: '6',55: '7',56: '8',57: '9',
    59: ';',61: '=',
    65: 'a',66: 'b',67: 'c',68: 'd',69: 'e',70: 'f',71: 'g',72: 'h',73: 'i',
    74: 'j',75: 'k',76: 'l',77: 'm',78: 'n',79: 'o',80: 'p',81: 'q',82: 'r',
    83: 's',84: 't',85: 'u',86: 'v',87: 'w',88: 'x',89: 'y',90: 'z',
    91: 'OSleft',92: 'OSright',93: 'OSright',
    96: 'numpad0',97: 'numpad1',98: 'numpad2',99: 'numpad3',100: 'numpad4',
    101: 'numpad5',102: 'numpad6',103: 'numpad7',104: 'numpad8',105: 'numpad9',
    106: 'numpadmultiply',107: 'numpadadd',109: 'numpadsubtract',
    110: 'numpaddecimal',111: 'numpaddivide',
    112: 'f1',113: 'f2',114: 'f3',115: 'f4',116: 'f5',117: 'f6',118: 'f7',
    119: 'f8',120: 'f9',121: 'f10',122: 'f11',123: 'f12',124: 'f13',125: 'f14',
    126: 'f15',144: 'numlock',145: 'scrolllock',
    173: '-',186: ';',187: '=',188: ',',189: '-',190: '.',191: '/',192: '`',
    219: '[',220: '\\',221: ']',222: "'",224: 'command'
};

function codeToKey(code)
{
    return (keyboardCodes[code] || "nokey");
}
var keyValue = codeToKey; // alias compatible with zen.js

var keyboardKeys =
{
    'backspace': 8,'tab': 9,'enter': 13,'return': 13,'shift': 16,
    'control': 17,'ctrl': 17,'alt': 18,'pause': 19,
    'capslock': 20,'escape': 27,'esc': 27,'space': 32,'spacebar': 32,' ': 32,
    'pageup': 33,'pagedown': 34,'end': 35,'home': 36,
    'leftarrow': 37,'left': 37,'uparrow': 38,'up': 38,'rightarrow': 39,
    'right': 39,'downarrow': 40,'down': 40,'insert': 45,'delete': 46,
    '0': 48,'1': 49,'2': 50,'3': 51,'4': 52,'5': 53,'6': 54,'7': 55,
    '8': 56,'9': 57,
    'a': 65,'b': 66,'c': 67,'d': 68,'e': 69,'f': 70,'g': 71,'h': 72,'i': 73,
    'j': 74,'k': 75,'l': 76,'m': 77,'n': 78,'o': 79,'p': 80,'q': 81,'r': 82,
    's': 83,'t': 84,'u': 85,'v': 86,'w': 87,'x': 88,'y': 89,'z': 90,
    'A': 65,'B': 66,'C': 67,'D': 68,'E': 69,'F': 70,'G': 71,'H': 72,'I': 73,
    'J': 74,'K': 75,'L': 76,'M': 77,'N': 78,'O': 79,'P': 80,'Q': 81,'R': 82,
    'S': 83,'T': 84,'U': 85,'V': 86,'W': 87,'X': 88,'Y': 89,'Z': 90,
    'OSleft': 91,'commandleft': 91,'Windows': 91,'OSright': 92,
    'commandright': 93,'numpad0': 96,'numpad1': 97,'numpad2': 98,'numpad3': 99,
    'numpad4': 100,'numpad5': 101,'numpad6': 102,'numpad7': 103,'numpad8': 104,
    'numpad9': 105,'numpadmultiply': 106,'numpadadd': 107,'numpadsubtract': 109,
    'numpaddecimal': 110,'numpaddivide': 111,
    'f1': 112,'f2': 113,'f3': 114,'f4': 115,'f5': 116,'f6': 117,'f7': 118,
    'f8': 119,'f9': 120,'f10': 121,'f11': 122,'f12': 123,'f13': 124,'f14': 125,
    'f15': 126,'numlock': 144,'scrolllock': 145,
    'semicolon': 186,';': 186,'equal': 187,'=': 187,'comma': 188,',': 188,
    'minus': 189,'-': 189,'period': 190,'.': 190,'slash': 191,'/': 191,
    'backquote': 192,'`': 192,'bracketleft': 219,'[': 219,
    'backslash':220,'\\': 220,'bracketright': 221,']': 221,
    'quote':222,"'":222,'command': 224
};

function keyToCode(key)
{
    return (keyboardKeys[key] || 0);
}

function disableKeyboard()
{
    document.onkeyup = null;
    document.onkeydown = null;
}

function disableTouch(objs)
{
    if (objs === "document")
    {
        document.ontouchend = null;
    }
    else {
        for (var i = 0; i < objs.length; i++)
        {
            objs[i].ontouchstart = null;
            objs[i].ontouchend = null;
        }
    }
}

function disableSelect()
{
    var s = document.body.style;

    if(typeof s.webkitUserSelect !== "undefined") s.webkitUserSelect = "none";
    else if(typeof s.MozUserSelect !== "undefined") s.MozUserSelect = "none";
    else if(typeof s.msUserSelect !== "undefined") s.msUserSelect = "none";
    else if(typeof s.oUserSelect !== "undefined") s.oUserSelect = "none";
    else if(typeof s.userSelect !== "undefined") s.userSelect = "none";
    else if(typeof document.onselectstart !== "undefined")
            document.onselectstart = function(){return false;};
}

function disableRightClick()
{
    if(typeof document.oncontextmenu !== "undefined")
        document.oncontextmenu = function() { return false; }
}

function disableDrag()
{
    if(typeof document.ondragstart !== "undefined")
        document.ondragstart = function() { return false; }
}

function disableElasticScrolling()
{
    if(typeof document.ontouchmove !== "undefined")
        document.ontouchmove = function (e)
        {
            e.preventDefault();
            e.stopPropagation();
        }
}

function disableDoubleTapZoom()
{
    if('touchAction' in document.body.style)
    {
        document.body.style.touchAction = 'manipulation';
    }
    else if ('msTouchAction' in document.body.style)
    {
        document.body.style.msTouchAction = 'manipulation';
    }
}

function getWindowHeight()
{
    var y = 0;

    if (self.innerHeight) {
        y = self.innerHeight;
    } else if (	document.documentElement &&
        document.documentElement.clientHeight) {
        y = document.documentElement.clientHeight;
    } else if (document.body) {
        y = document.body.clientHeight;
    }

    return y;
}

function getWindowWidth()
{
    var x = 0;

    if (self.innerWidth) {
        x = self.innerWidth;
    } else if (	document.documentElement &&
        document.documentElement.clientWidth) {
        x = document.documentElement.clientWidth;
    } else if (document.body) {
        x = document.body.clientWidth;
    }
    return x;
}

function getAspectRatio()
{
    return screen.height < screen.width ?
           screen.width / screen.height :
           screen.height / screen.width;
}

function getBoundingClientRectWithScroll(el)
{
    var box = el.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    var right = box.right + scrollLeft - clientLeft;
    var bottom = box.bottom +  scrollTop - clientTop;
    var height = box.bottom - box.top;
    var width = box.right - box.left;

    return { top: Math.round(top),
             left: Math.round(left),
             right: Math.round(right),
             bottom: Math.round(bottom),
             height: Math.round(height),
             width: Math.round(width)}
}

function regularPolygon(nv,cx,cy,cr,theta)
{
    if(nv < 3) return;

    var vertices = [];
    var a = Math.PI * 2 / nv;
    theta = theta * Math.PI / 180;

    for(var i = 0; i < nv ; i++)
    {
        vertices.push({x: cx + cr * Math.cos(i * a + theta),
                       y: cy - cr * Math.sin(i * a + theta)});
    }

    return vertices;
}

function svgPathString(vxy,closedPath)
{
    var svgPath;

    svgPath = 'M' + vxy[0].x + ' ' + vxy[0].y + 'L';
    for(var i = 1; i < vxy.length; i++)
    {
        svgPath = svgPath + vxy[i].x + ' ' + vxy[i].y + ' ';
    }
    if(closedPath) svgPath = svgPath + 'Z';

    return svgPath;
}

function randInt(a,b)
{
    if (!b)
    {
        a = a || 2;
        return Math.floor(Math.random()*a);
    }
    else
    {
        return Math.floor(Math.random()*(b-a+1)) + a;
    }
}
var coinFlip = randInt; // alias compatible with zen.js

function randSign()
{
    if(Math.random()<0.5) return(-1);
    else return(1);
}

function combinations(arr, k)
{
    var i, subI, ret = [], sub,next;

    for(i = 0; i < arr.length; i++)
    {
        if(k === 1)
        {
            ret.push( [ arr[i] ] );
        }
        else
        {
            sub = combinations(arr.slice(i+1, arr.length), k-1);
            for(subI = 0; subI < sub.length; subI++ )
            {
                next = sub[subI];
                next.unshift(arr[i]);
                ret.push( next );
            }
        }
    }
    return ret;
}

function range(m,n)
{
    var a = [];
    for(var i=m;i<=n;i++) a.push(i);
    return a;
}

function linSpace(a,b,n)
{
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n < 2) {return n === 1 ? [a] : [];}

    var i, ret = new Array(n);

    n--;

    for(i = n; i >= 0; i--) {ret[i] = (i * b + (n - i) * a) / n;}

    return ret;
}

if(!Number.prototype.round)
{
    Number.prototype.round = function (places)
    {
        if (typeof places === "undefined")
        {
            places = 0;
        }
        if (!(typeof places === "number") ||
            !((places + 1) % 1 === 0) ||
            !((places + 1) > 0))
        {
            throw new TypeError("Numer.prototype.round requires 0 or " +
                "a natural number for precision argument");
        }
        var m = Math.pow(10, places);
        return Math.round(this * m) / m;
    };
}

function isEven(n)
{
    return n === parseFloat(n) ? !(n%2) : void 0;
}

function wrapRads (r)
{
    while (r > Math.PI) r -= 2 * Math.PI;
    while (r < -Math.PI) r += 2 * Math.PI;

    return r;
}

function sizeToDegrees(size, viewingDistance)
{
    viewingDistance = viewingDistance || 57.294;
    return 2 * Math.atan2(size, 2* viewingDistance) * 180 / Math.PI;
}
var centimetersToDegrees = sizeToDegrees; // alias compatible with zen.js

function degreesToSize(degrees, viewingDistance)
{
    viewingDistance = viewingDistance || 57.294;
    return 2 * viewingDistance * Math.tan(degrees * Math.PI / 360);
}
var degreesToCentimeters = degreesToSize; // alias compatible with zen.js

function euclidDistance (x1,y1,x2,y2)
{
    var dx = x1 - x2;
    var dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
}

function euclidDistanceSquared (x1,y1,x2,y2)
{
    var dx, dy;

    dx = x1 - x2;
    dy = y1 - y2;

    return dx * dx + dy * dy;
}

function vecPvector(p1, p2)
{
    var result = {};

    result.x = p2.x - p1.x;
    result.y = p2.y - p1.y;

    return result;
}

function vecLength(v)
{
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function vecAngle(v)
{
    var radAngle = Math.atan2(v.y, v.x);

    return (wrapRads(radAngle));
}

function vecDotProduct(v1, v2)
{
    return v1.x * v2.x + v1.y * v2.y;
}

function vecCrossProduct(v1, v2)
{
    return v1.x * v2.y - v1.y * v2.x;
}

function vecAngleBetween(v1,v2)
{
    var radAngle = Math.atan2(v2.y, v2.x) -
                   Math.atan2(v1.y, v1.x);

    // returns the rotation in radians of v2 relative to v1,
    // positive CCW, negative CW
    return (wrapRads(radAngle));
}

function segmentsIntersect(p1,p2,p3,p4)
{
    function pointsOverlap(point1, point2)
    {
        return (point1.x === point2.x) && (point1.y === point2.y)
    }

    function allEqual(args)
    {
        var firstValue = arguments[0];

        for (var i = 1; i < arguments.length; i += 1)
        {
            if (arguments[i] !== firstValue)
                return false;
        }
        return true;
    }

    var q = vecPvector(p1, p3);
    var r = vecPvector(p1, p2);
    var s = vecPvector(p3, p4);

    var commonDenominator = vecCrossProduct(r, s);
    var betaNumerator = vecCrossProduct(q, r);

    if (commonDenominator === 0)
    {
        if (betaNumerator === 0)
        {
            if(!allEqual((p3.x - p1.x < 0),(p3.x - p2.x < 0),(p4.x - p1.x < 0),(p4.x - p2.x < 0)) ||
               !allEqual((p3.y - p1.y < 0),(p3.y - p2.y < 0),(p4.y - p1.y < 0),(p4.y - p2.y < 0)))
                return 1;

            else if (pointsOverlap(p1, p3) || pointsOverlap(p1, p4) ||
                pointsOverlap(p2, p3) || pointsOverlap(p2, p4))
                return 2;
        }

        return 0;
    }

    var alphaNumerator = vecCrossProduct(q, s);

    var u = betaNumerator / commonDenominator;
    var t =  alphaNumerator / commonDenominator;

    if((t === 0 || t === 1) && (u === 0 || u === 1)) return 3;

    else if((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) return 4;

    return 0;
}

function pointSegmentDistance(p0,s1,s2)
{
    function dist2(p1, p2)
    {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;

        return dx*dx + dy*dy;
    }

    var l2 = dist2(s1, s2);

    if (l2 === 0) return Math.sqrt(dist2(p0,s1));

    var t = ((p0.x - s1.x) * (s2.x - s1.x) +
             (p0.y - s1.y) * (s2.y - s1.y)) / l2;

    if (t < 0) return Math.sqrt(dist2(p0,s1));

    if (t > 1) return Math.sqrt(dist2(p0,s2));

    return Math.sqrt(dist2(p0, { x: s1.x + t * (s2.x - s1.x),
                                 y: s1.y + t * (s2.y - s1.y) }));
}

function polygonIsComplex(pn)
{
    var isect, len;

    if((len = pn.length) > 2)
    {
        for (var i = 1; i < len - 1; i++)
        {
            for (var j = 0; j < i; j++)
            {
                isect = segmentsIntersect(pn[j], pn[j + 1], pn[i], pn[i + 1]);
                if (isect !== 0 && isect !== 3) return [isect, j, i];
            }
        }

        for (j = 0; j < len - 1; j++)
        {
            isect = segmentsIntersect(pn[j], pn[j + 1], pn[len - 1], pn[0]);
            if (isect !== 0 && isect !== 3) return [isect, j, len - 1];
        }
    }
    return false;
}

function autoCorr(series,hiLag)
{
    var i, j, len, buffer;
    var avg, denom = 0, num = 0, aCorr = [];

    if(hiLag < 1 || hiLag > series.length - 1)
        throw new TypeError ("'hiLag' must be positive and less than 'series.length'.");

    buffer = series.slice();

    len = buffer.length;
    avg = buffer.average();

    for(i = 0; i < len; i++)
    {
        buffer[i] = buffer[i] - avg;
        denom += buffer[i] * buffer[i];
    }

    aCorr[0] = 1;

    for(j = 1; j < hiLag + 1; j++)
    {
        num = 0;
        for(i = 0; i < len - j - 1; i++)
            num += buffer[i] * buffer[i + j];
        aCorr[j] = num / denom;
    }

    return aCorr;
}

var now = (function()
{
    var performance = window.performance || {};

    performance.now = (function()
    {
        return performance.now          ||
               performance.webkitNow    ||
               performance.msNow        ||
               performance.oNow         ||
               performance.mozNow       ||
               function() { return new Date().getTime(); };
    })();

    return performance.now();
});

function getTimerGrain(ticks,callBack)
{
    var lags = [], totalTime, totalTicks, remainder, chunk;

    function measureGrain()
    {
        var start, timestamp, count, timerInterval, index;

        count = chunk;
        index = lags.length + 1;
        timestamp = start = now();

        while(count)
        {
            timerInterval = now();
            if(lags[index] = timerInterval - timestamp)
            {
                count--;
                index++;
                timestamp = timerInterval;
            }
        }

        totalTime += (timestamp - start);
        totalTicks += chunk;

        if(totalTicks === ticks)
        {
            timerInterval = lags.median().round(7);
            callBack(timerInterval);
        }
        else
        {
            if(totalTicks === ticks - remainder) chunk = remainder;

            setImmediate(measureGrain);
        }
    }

    if(ticks && callBack)
    {
        totalTime = totalTicks = 0;

        if(ticks > 100)
        {
            chunk = 100;
            remainder = ticks % 100;
        }
        else chunk = ticks;

        setImmediate(measureGrain);
    }

    else console.log("getTimerGrain needs how many 'ticks' to measure "+
                     "and a 'callBack' function to return the result.");
}

function getFrameTime(frames,callBack)
{
    var frameInterval, timestamp, intervals = [];

    function getRate()
    {
        frameInterval = timestamp;
        timestamp = now();
        frameInterval = timestamp - frameInterval;

        intervals.push(frameInterval);

        if(frames)
        {
            frames--;
            requestAnimationFrame(getRate);
        }
        else
        {
            frameInterval = intervals.median().round(3);

            callBack(frameInterval);
        }
    }

    if(frames && callBack)
        requestAnimationFrame(function()
        {
            timestamp = now();
            requestAnimationFrame(getRate);
        });
    else console.log("getFrameTime needs how many 'frames' to measure "+
                     "and a 'callback' function to return the result.");
}

function chainTimeouts()
{
    var nArgs = arguments.length;
    var start = arguments[0];

    // accept a single array as the argument
    if (nArgs === 1 && start instanceof Array)
    {
        arguments = start;
        nArgs = arguments.length;
        start = arguments[0];
    }

    // require an odd number of arguments
    if (nArgs % 2 === 0)
        throw new Error('chainTimeouts(): number of arguments must be odd');

    // execute the first argument immediately
    start();

    // set up timeouts for each even argument
    var timeoutsChain = [];
    for(var i = 2, execute_time = arguments[1];
        i < nArgs ;
        i += 2, execute_time += arguments[i-1])
        {
            timeoutsChain.push(setTimeout(arguments[i], execute_time));
        }

    return timeoutsChain;
}
var chain = chainTimeouts; // alias compatible with zen.js

function clearChainTimeouts(a)
{
    for(var i=0, len = a.length;i<len;i++)
        clearTimeout(a[i]);
}
var clearChain = clearChainTimeouts; // alias compatible with zen.js

function getAllCookies()
{
    var cookies = {};
    if (document.cookie && document.cookie != '')
    {
        var split = document.cookie.split('; ');
        for (var i = 0; i < split.length; i++)
        {
            var nameValue = split[i].split(/=(.+)?/);
            cookies[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
        }
    }
    return cookies;
}

function createCookie(name,value,expire,path,domain,secure)
{
    if(!name) return false;

    value = value ? value : "";

    if (expire !== undefined)
    {
        var date = new Date();
        date.setTime(date.getTime()+(expire*24*60*60*1000));
        expire = "; expires=" + date.toUTCString();
    }
    else expire = "; expires=0";

    path = path ? "; path=" + path : "; path=/";

    domain = domain ? "; domain=" + domain : "";

    secure = (secure || location.protocol === "https:") ? ";secure" : "";

    document.cookie = name + "=" +
                      value +
                      expire +
                      path +
                      domain +
                      secure;
}

function readCookie(name)
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++)
    {
        var c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name,path,domain)
{
    path = path ? "; path=" + path : "";
    domain = domain ? "; domain=" + domain : "";

    createCookie(name,"",-1,path,domain);
}

function safeDecode(s)
{
   s = s.replace(/\!/g,"/").replace(/-/g,"+").replace(/\./g,"=");
   return atob(s);
}
var urlsafedecode = safeDecode; // alias compatible with zen.js

function safeEncode(s)
{
    s = btoa(s);
    s = s.replace(/\//g,"!").replace(/\+/g,"-").replace(/\=/g,".");
    return s;
}

function getPastResults(test)
{
    return RawDeflate.inflate(safeDecode(readCookie("t."+test)));
}

function insertAfter( referenceNode, newNode )
{
    referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
}

function generateForm(survey, node, action, method, buttonText)
{
    var self = generateForm;

    function tag(kind, options)
    {
        var str = "<" + kind + " ";
        var optStr = [];
        for(var i in options)
        {
            if (options.hasOwnProperty(i) && i !== "content")
                optStr.push(i+"=" + '"' + options[i] + '"');
        }
        str += optStr.join(" ") + ">";
        if (typeof options.content !== "undefined")
        {
            str += options.content;
        }
        str += "</" + kind + ">";
        return str;
    }

    if (typeof self.numForms === "undefined")
    {
        self.numForms = 1;
    } else
    {
        self.numForms++;
    }

    var formId = "__form" + (self.numForms - 1);
    method === undefined ? method = 'POST' : method = method;
    onsubmit = "alert('blart');";
    var str = "<form id='"+formId+"' action='"+action+"' method='"+method+"'><ol>";
    for(var a=0,b;b=survey[a];a++)
    {
        if(b.type === "textdiv")
        {
            b.optional = true;
            str += tag('div', {id: b.name, size: b.length, content: b.content, "class":'zen_infoblock'});
            continue;
        }

        if(b.question!=='')
        {
            str += (b.type !== ("hidden" || "text") ? "<li>" : "");
            str += "<p><div class='zen_question zen_" + b.type + "' id='zen_" + b.name + "_question'>" + b.question + "</div><div class='zen_input zen_" + b.type + (typeof(b.subtype) !== "undefined" ? " zen_" + b.subtype : "") + "' id='zen_" + b.name + "_input'>";
        }

        switch(b.type)
        {
            case '':
                str += tag('input', {type: "text", id: b.name});
                break;
            case 'text':
                str += tag('input', {type: "text", maxlength: b.length, id: b.name, size: b.length});
                break;
            case 'hidden':
                b.optional = true;
                b.question = b.name;
                str += tag('input', {type: "hidden", id: b.name});
                break;
            case 'checkbox':
            case 'radio':
                b.options.map(function(o,i)
                {
                    var id = b.name + "[" + i + "]";
                    str +=  tag('span',
                    {
                        "class":(typeof(b.subtype) !== 'undefined' ? "zen_" + b.subtype : "zen_" + b.type),
                        "content":  tag('input',{type: b.type, name: b.name, id: id, value: (typeof(b.values) !== 'undefined' ? b.values[i] : b.options[i]), "class": "zen_"+b.type}) +
                        tag('label',{"for": id, content: o})
                    });
                });
                break;
            case 'dropdown':
                str += "<select id='"+b.name+"' name= '"+b.name+"'>";
                b.options.map(function(o,i)
                {
                    var id = b.name + "[" + i + "]";
                    str += tag('option',
                    {
                        type: b.type,
                        content: o,
                        id: id,
                        value: (typeof(b.values) !== 'undefined' ? b.values[i] : b.options[i]),
                        "class": "zen_"+b.type
                    });
                    str = str.substring(0,str.lastIndexOf('"') + 1) + (b.selected === b.options[i] ? " selected='selected' " : " ") + str.substring(str.lastIndexOf('"') + 1);
                });
                str+= "</select>";
                break;
            case 'textarea':
                str += tag('textarea', {name: b.name, rows: b.rows, cols: b.cols, id: b.name, "class": (typeof(b.subtype) !== "undefined" ? " zen_" + b.subtype : "")});
                break;
        }

        str += '</div></p>';
        str += (b.type !== 'hidden' ? '</li>' : "");

    }
    if(buttonText)
    {
        str = str + "<br /><button type='button' id='zen_submit' onclick='document.forms." + formId + ".validate();'>"+buttonText+"</button>";
    }
    else
    {
        str = str + "<br /><button type='button' id='zen_submit' onclick='document.forms." + formId + ".validate();'>Next</button>";
    }
    str += "<input type='hidden' name='data' id='data' /><input type='hidden' name='score' id='score'/></form>";
    node.innerHTML += str;

    getID(formId).validate = function()
    {
        var results = [];
        var score = 0;
        var finalCheck = true;
        var error = false;
        var form = getID(formId);
        survey.map(function(item)
        {
            var id = item.name;

            var el, value, answer;

            if (item.type === "checkbox" || item.type === "radio")
            {
                value = [];
                for(var i=0, len = item.options.length; i < len; i++)
                {
                    var option = getID(item.name+"["+i+"]");
                    if (option.checked)
                    {
                        value.push(option.value);
                        if(item.values)
                        {
                            score += option.value*1;
                        }
                    }

                }

                if (item.type === "radio")
                {
                    value = value.shift();
                    item.validate = function(o) { return o; }
                } else
                {
                    item.validate = function(o) { return o.length; }
                }
                answer = value;
                el = getID(item.name+"["+(i-1)+"]");
            }
            else if( item.type === "dropdown")
            {
                for(var i=0, len = item.options.length; i< len; i++)
                {
                    var option = getID(item.name+"["+i+"]");
                    if(option.selected)
                    {
                        //value = option.value*1;
                        answer = option.value;
                        if(item.values)
                        {
                            answer = option.value*1;
                            score+= option.value*1;
                        }
                    }
                }
                el = form[item.name];
                value = getID(item.name).options[0].selected;
                value = !value;
                item.validate = function(o) {return o;};
            }
            else
            {
                value = [];
                el = form[item.name] ? form[item.name] : getID(item.name);
                value = el.value;
                answer = el.value;
            }


            if(!item.optional /*&& !item.text*/)
            {
                var errorEl = getID(id + ".err");

                if (!errorEl)
                {
                    errorEl = document.createElement("span");
                    errorEl.id = id + ".err";
                    errorEl.className = "zen_error";
                    insertAfter(getID('zen_' + id + '_input'), errorEl);
                }


                var notBlank = function(val) { return !(val === ""); };
                var validate = item.validate || notBlank;

                if (!validate(value))
                {
                    error = true;
                    finalCheck = false;
                    errorEl.innerHTML = "required";
                }
                else
                {
                    errorEl.innerHTML = "";
                    var ans = new Object();
                    eval( "ans.zen_" + item.name + "= answer");
                    results.push(ans);
                    //results.push({ eval(item.name) : answer});
                }
            }
            else
            {
                var ans = new Object();
                eval( "ans.zen_" + item.name + "= answer");
                results.push(ans);
            }
        });

        var errorTot = getID(formId + ".err");

        if(!errorTot)
        {
            errorTot = document.createElement("span");
            errorTot.id = formId	 + ".err";
            errorTot.className = "zen_err_flag";
            insertAfter(getID('zen_submit'), errorTot);
        }

        getID('data').value =JSON.stringify(results);
        getID('score').value = isNaN(score) ? 0 : score;
        if(finalCheck)
        {
            getID(formId).submit();
        }
        else
        {
            errorTot.innerHTML = "There is a problem with your form submission.  Please check that you have filled out all required fields correctly.";
            return finalCheck;
        }
    }
}



