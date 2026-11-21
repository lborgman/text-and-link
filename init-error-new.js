const INIT_ERROR_VER = "0.1.8";

if (!document.currentScript) throw Error("init-error.js must not be loaded as a module");

// Simple tagged console logger
/**
 * @callback LogConsoleHereIs
 * @param {string} msg
 */

window.logConsoleHereIs = (msg) => {
    // console.log(`%c${msg}`, "color:white; background-color:blue; padding: 0px 5px;");
}

window.logConsoleHereIs(`here is init-error.js ${INIT_ERROR_VER}`);

{
    let numErrors = 0;

    /** @param {ErrorEvent | PromiseRejectionEvent} evt */
    const doDisplay = (evt) => {
        // @ts-ignore
        if (window["in-app-screen"]) return;
        if (numErrors++ > 0) return;

        // Extract the actual Error object
        // ErrorEvent:             evt.error  (the thrown value)
        // PromiseRejectionEvent:  evt.reason (the rejected value)
        const errorObj = evt instanceof ErrorEvent ? evt.error : evt.reason;

        /*
        const OLDmessage =
            (errorObj instanceof Error ? errorObj.message : String(errorObj)) ||
            evt.message || // ErrorEvent fallback
            "Unknown error";
        */
        const message = "message" in evt
            ? evt.message
            : String(evt.reason?.message ?? evt.reason);
        const stack = errorObj instanceof Error ? errorObj.stack : null;

        // Optional custom alert hook
        /** @type {((message: string, evt?: Event) => void) | undefined} */
        const alertError = /** @type {*} */ (window)["alertError"];
        if (typeof alertError === "function") {
            alertError(message, evt);
            return;
        }

        // Build hint text
        let hint = "";
        if (/SyntaxError/.test(message)) {
            hint += "The file did not parse.";
            if (/export/.test(message)) hint += " It should probably be loaded as a module.";
        }

        // Build dialog
        const dlg = Object.assign(document.createElement("dialog"), {
            style:
                `
                all: revert;
                opacity: 1;
                visibility: visible;
                background:red;
                color:black;
                font-size:1rem;
                border-radius:1rem;
                max-width:80dvw;
                max-inline-size:80dvw;
                `
        });
        dlg.id = "error-dialog";

        dlg.append(
            Object.assign(document.createElement("h2"), { textContent: "Error" }),
            Object.assign(document.createElement("p"), { textContent: message }),
        );

        if (hint) {
            dlg.append(Object.assign(document.createElement("p"), { textContent: hint }));
        }
        const locationInfo = "filename" in evt
            ? `${evt.filename ?? "No filename"}:${evt.lineno ?? "?"}`
            : "Promise rejection (no line info)";
        const pre = Object.assign(document.createElement("pre"), {
            // textContent: [location.href, stack ?? `${evt.filename ?? "No filename"}:${evt.lineno ?? "?"}`].join("\n\n"),
            textContent: [location.href, stack ?? locationInfo].join("\n\n"),
            style:
                `

  display: block ;
  width: 100% ;
  max-width: 100% ;
  box-sizing: border-box ;
  white-space: pre-wrap ;
  word-break: break-all ;
  overflow-wrap: anywhere ;
  overflow-x: hidden;

                background:orange;
                padding:4px;
                margin-bottom:10px;
                `
        });
        dlg.append(pre);

        const btn = Object.assign(document.createElement("button"), { textContent: "Close" });
        btn.addEventListener("click", (evt) => {
            evt.stopImmediatePropagation();
            // debugger;
            // dlg.close();
            dlg.remove();
            numErrors = 0;
        });
        dlg.append(btn);

        document.body.appendChild(dlg);
        dlg.showModal();
    };

    /** @param {ErrorEvent | PromiseRejectionEvent} evt */
    const displayError = (evt) => {
        if (document.readyState !== "loading") { doDisplay(evt); return; }
        document.addEventListener("DOMContentLoaded", () => doDisplay(evt), { once: true });
    };

    window.addEventListener("error", displayError);

    window.addEventListener("unhandledrejection", (evt) => {
        console.log("unhandledrejection", evt);
        displayError(evt);
    });
}


/**
 * @typedef {Record<string, string>} DynamicStringObject
 */

/* *
 * @callback MkEltFn
 * @param {string} type
 * @param {DynamicStringObject} [attrib]
 * @param {string|string[]|HTMLElement|HTMLElement[]} [inner]
 * @returns {HTMLElement}
 */
/* *
 * @template {string} T
 * @callback MkEltFn
 * @param {T} type
 * @param {DynamicStringObject} [attrib]
 * @param {string | string[] | HTMLElement | HTMLElement[]} [inner]
 * @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement}
 */
/* @global */

/**
 * @typedef  {string | HTMLElement | (string | HTMLElement)[]} MkEltFnInner
 */
//  *   inner?: string | HTMLElement | (string | HTMLElement)[]
/**
 * @typedef {<T extends string>(
 *   type: T,
 *   attrib?: DynamicStringObject,
 *   inner?: MkEltFnInner
 * ) => T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement} MkEltFn
 */

/** @type {MkEltFn} */
var mkElt;


window.mkElt = (() => {
    /** @type {MkEltFn} */
    function mkElt(type, attrib, inner) {
        const elt = document.createElement(type);
        /** @param {MkEltFnInner} inr */
        function addInner(inr) {
            if (inr instanceof Element) {
                elt.appendChild(inr);
            } else {
                const txt = document.createTextNode(inr.toString());
                elt.appendChild(txt);
            }
        }
        if (inner) {
            if (Array.isArray(inner))
                for (const item of inner) addInner(item);
            else
                addInner(inner);
        }
        for (var x in attrib) {
            elt.setAttribute(x, attrib[x]);
        }
        return /** @type {*} */ (elt);
    }
    return mkElt;
})();


/*
Reduntant in every modern browser 2026

// https://stackoverflow.com/questions/61080783/handling-errors-in-async-event-handlers-in-javascript-in-the-web-browser
// Error handling with Async/Await in JS - ITNEXT
// https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
window.OLDerrorHandlerAsyncEvent = (() => {
    function OLDerrorHandlerAsyncEvent(asyncFun) {
        return function (evt) {
            asyncFun(evt).catch(err => {
                console.log("handler", err);
                throw err;
            })
        }
    }
    return OLDerrorHandlerAsyncEvent;
})();
*/

/**
 * 
 * @param {string} relLink 
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function makeAbsLink(relLink) {
    if (relLink.startsWith("/")) throw Error(`relLink should not start with "/" "${relLink}`);
    const u = new URL(relLink, document.baseURI);
    return u.href;
}
// window.makeAbsLink = makeAbsLink;

// throw "Test error";