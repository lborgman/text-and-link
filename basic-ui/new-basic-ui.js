// @ts-check

const BASIC_UI_VER = "0.0.01";
// @ts-ignore
logConsoleHereIs(`here is basic-ui.js, module,${BASIC_UI_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

// @ts-ignore
const mkElt = window["mkElt"];

/**
 * @param {function} [funClose]
 * @returns {HTMLButtonElement}
 * @category Visual elements
 */
export function mkXclose(funClose) {
    const xClose = mkElt("button", { class: "x-close" }, "✖");
    xClose.addEventListener("click", evt => {
        evt.stopPropagation();
        // debugger;
        if (funClose) {
            funClose();
            return;
        }
        (xClose.closest("dialog"))?.close();
    });
    return xClose;
}
/**
 * 
 * @param {HTMLDialogElement} dialog 
 * @returns {HTMLButtonElement}
 * @category Visual elements
 */
export function addXclose(dialog) {
    const btnClose = dialog.querySelector("button[class=x-close]");
    if (btnClose) { return; }
    const elt = mkXclose();
    dialog.appendChild(elt);
    return elt;
}

document.documentElement.addEventListener("click",
    /** @param {MouseEvent} evt */
    evt => {
        // if (!evt.target) return;


        //// Click on ::backdrop does not work when delegated
        //// because ::backdrop is a pseudo-element!
        // const target = /** @type {Element} */ (evt.target);
        // const dialog = target;
        // const isOnDialog = target instanceof HTMLDialogElement;

        const openDialog = document.querySelector("dialog[open]");
        const isOnDialogBackdrop = (() => {
            // Syntetic click:
            if (0 == evt.clientX + evt.clientY) { return false; }
            // if (!evt.isDelayedClick) { return false; }

            if (openDialog == null) { return false; }
            const rect = openDialog.getBoundingClientRect();
            const clickedOutside =
                evt.clientX < rect.left ||
                evt.clientX > rect.right ||
                evt.clientY < rect.top ||
                evt.clientY > rect.bottom;
            return clickedOutside;
        })();

        if (isOnDialogBackdrop) {
            const dialog = openDialog;
            // FIX-ME: NOTE: first child element must covers the whole <dialog>
            const rect = dialog.getBoundingClientRect();
            const scrollbarWidth = dialog.offsetWidth - dialog.clientWidth;
            const xFromRight = rect.right - evt.clientX;
            // Ignore if click is in scrollbar area
            if (xFromRight <= scrollbarWidth && xFromRight > 0) {
                return;
            }
            evt.stopPropagation();
            evt.preventDefault();
            closeDialog(dialog);
            return;
        }

        const target = /** @type {Element} */ (evt.target);
        const button = target.closest("button")
        if (button) {
            // console.log("----- button click", evt);
            if (!evt.isDelayedClick) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
                // console.log("----- button click, !evt.isDelayedClick");
                addRippleAndClickDelayed(evt, button);
                return;
            }
            return;
        }
    },
    { capture: true }
);

function addRippleAndClickDelayed(event, button) {
    const currentRipple = button.getElementsByClassName("basicUI_ripple")[0];
    if (currentRipple) { return; }

    const circle = document.createElement("span");
    const bcrButton = button.getBoundingClientRect();
    const diameter = Math.max(bcrButton.width, bcrButton.height); // FIX-ME: ??
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    // circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.left = `${event.clientX - bcrButton.left - radius}px`;
    // circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.style.top = `${event.clientY - bcrButton.top - radius}px`;
    circle.classList.add("basicUI_ripple");



    const basicUI_rippleDuration = getRootCssVarMs("--basicUI_ripple-duration");

    // circle.addEventListener("animationend", () => { whenRippleFinishes(); });
    //// Much easier to use timeout.  And more flexible.
    setTimeout(whenRippleFinishes, basicUI_rippleDuration * 0.5);



    function whenRippleFinishes() {
        circle.remove();
        const delayedClick = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
        });
        delayedClick.isDelayedClick = true;
        button.dispatchEvent(delayedClick)
    }
    // getProperty

    button.appendChild(circle);
}

/*
const buttons = document.getElementsByTagName("button");
for (const button of buttons) {
  button.addEventListener("click", createRipple);
}
*/

/**
 * 
 * @param {HTMLDialogElement} dialog 
 */
function closeDialog(dialog) {
    console.log("closeDialog", dialog);
    dialog.close();
    if (!dialog.classList.contains("html-dialog")) {
        console.log("closeDialog remove");
        dialog.remove();
    }
}


/**
 * @param {any} icon 
 * @param {string} title 
 * @param {boolean} small 
 * @returns {HTMLButtonElement}
 * @category Visual elements
 */
export function mkFabButton(icon, title, small) {
    const btn = mkElt("button", undefined, icon);
    btn.classList.add("fab-button");
    btn.title = title;
    if (small) {
        btn.classList.add("fab-button-small");
    }
    return btn;
}

/**
 * 
 * @param {any} icon 
 * @param {string} title 
 * @returns {HTMLButtonElement}
 * @category Visual elements
 */
export function mkIconButton(icon, title) {
    const btn = mkElt("button", undefined, icon);
    btn.classList.add("icon-button");
    btn.title = title;
    return btn;
}



// Modify your dialog opening function to include this viewport verification check:
/**
 * @param {HTMLElement} bdy 
 * @throws {TypeError}
 */
function openModalAndEnsureKeyboard(bdy) {
    const dlg = document.createElement("dialog");
    dlg.appendChild(bdy);
    document.documentElement.appendChild(dlg);

    // 1. Open the modal normally (browser will focus the Save button)
    dlg.showModal();
    requestAnimationFrame(() => dlg.classList.add("fade-backdrop"));

    // 2. Wait a split second for the mobile browser to process the focus change
    setTimeout(() => {
        if (!window.visualViewport) return;

        const visualHeight = window.visualViewport.height;
        const totalHeight = window.innerHeight;

        // 3. The Visual Viewport Check: 
        // If the difference is negligible, the keyboard DID NOT open.
        const keyboardIsOpen = (totalHeight - visualHeight) > 15;

        if (!keyboardIsOpen) {
            console.log("Viewport unchanged. Forcing focus to bring up keyboard.");

            // Look exclusively inside this dialog for the text element
            const textInput = dlg.querySelector(
                'textarea, input:not([type="button"]):not([type="submit"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), [contenteditable="true"]'
            );
            if (!(textInput instanceof HTMLElement)) {
                debugger;
                throw TypeError("textInput is not HTMLElement");
            }

            if (textInput) {
                textInput.focus();
                // textInput.click();
            }
        }
    }, 150); // 150ms gives the mobile OS time to trigger the viewport resize if it was going to
}



/**
 * Show a dialog.
 * To remove the upper right X close button
 * add CSS class "no-x-close-button" to bdy.
 * 
 * @param {HTMLDivElement} bdy 
 * @param {function|undefined} [retValFun]
 * @param {undefined|HTMLButtonElement[]} [buttons]
 * @param {string} [dialogClass]
 * @returns {Promise<any>}
 * @category Visual helpers
 */
export async function showDialog(bdy, retValFun, buttons, dialogClass) {
    if (retValFun != undefined) {
        if (typeof retValFun !== 'function') {
            debugger;
            throw TypeError('Parameter "valFun" must be a function');
        }
        if (retValFun.constructor.name !== 'AsyncFunction') {
            debugger;
            throw TypeError('Function "valFun" must be async');
        }
        if (retValFun.length !== 0) {
            debugger;
            throw RangeError('Async function "valFun" must take 0 parameters');
        }
    }
    if (typeof bdy == "string") { bdy = mkElt("div", undefined, bdy); }
    if (!(bdy instanceof HTMLDivElement)) {
        debugger;
        throw TypeError("bdy is not <div>");
    }
    // bdy.classList.add("modal-scroll-body");
    const dlg = mkElt("dialog", undefined, bdy);
    if (dialogClass) dlg.classList.add(dialogClass);
    dlg.addEventListener("close", evt => { console.log("%%%%% dlg close"); });
    dlg.addEventListener("cancel", evt => { console.log("%%%%% dlg cancel"); });
    if (buttons) {
        let myButtons = buttons;
        if (!Array.isArray(myButtons)) { myButtons = [buttons]; }
        const eltButtons = mkElt("div", { class: "dialog-buttons" });
        myButtons.forEach(b => {
            if (!(b instanceof HTMLButtonElement)) {
                debugger;
                throw TypeError("showDialog: buttons must only contain <button>");
            }
            eltButtons.appendChild(b);
        });
        dlg.appendChild(eltButtons);
    }
    const eltX = addXclose(dlg);

    // Look exclusively inside this dialog for the text element
    const textInput = dlg.querySelector(
        'textarea, input:not([type="button"]):not([type="submit"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), [contenteditable="true"]'
    );
    if (textInput && !(textInput instanceof HTMLElement)) {
        debugger;
        throw TypeError("textInput is not HTMLElement");
    }

    if (textInput) {
        textInput.focus();
        dlg.classList.add("has-text-input");
        /** @type {HTMLDivElement|undefined} */
        const eltScroll = mkElt("div", {
            style: "height: 0.5px; padding: 0; margin:0;",
            class: "scroll-for-text-input"
        });
        dlg.insertBefore(eltScroll, dlg.firstElementChild);
        scrollForTextInput(dlg);
    }


    document.documentElement.appendChild(dlg);
    dlg.showModal();
    requestAnimationFrame(() => dlg.classList.add("fade-backdrop"));
    syncViewport();
    // openModalAndEnsureKeyboard(bdy);

    if (!retValFun) return;
    const promClose = new Promise(resolve => {
        dlg.addEventListener("close", evt => { resolve("close"); });
    });
    // debugger;
    // const ans = await valFun();
    const ans = await Promise.race([retValFun(), promClose]);
    const tofAns = typeof ans;
    if (tofAns != "boolean" && ans != "close") {
        debugger;
    }
    return ans;
}
/**
 * 
 * @param {HTMLDivElement} bdy 
 * @param {string} [ok]
 * @param {string} [cancel]
 * @throws {TypeError}
 * @category Visual helpers
 */
export async function showDialogConfirm(bdy, ok, cancel, funOkButton) {
    bdy.classList.add("no-x-close-button"); // Remove the upper right X close button
    ok = ok || "OK";
    cancel = cancel || "Cancel";
    const btnTrue = mkElt("button", { class: "button-ok" }, ok);
    if (funOkButton) { funOkButton(btnTrue); }
    const btnFalse = mkElt("button", undefined, cancel);
    const funAns = async () => {
        return await new Promise(resolve => {
            btnTrue.addEventListener("click", evt => {
                resolve(true);
                closeMyDialog(btnTrue);
            });
            btnFalse.addEventListener("click", evt => {
                resolve(false);
                closeMyDialog(btnFalse);
            });
        });
    }
    const ans = await showDialog(bdy, funAns, [btnTrue, btnFalse]);
    if (ans == "close") {
        // Return false on close event
        return false;
    }
    const tofAns = typeof ans;
    if (tofAns != "boolean") {
        const msg = `showDialogConfirm: typeof ans == "${tofAns}`;
        console.error(msg);
        debugger;
        throw TypeError(msg);
    }
    return ans;
}
/**
 * @param {HTMLElement} elt 
 * @throws {ReferenceError}
 * @category Visual helpers
 */
export function closeMyDialog(elt) {
    const dlg = elt.closest("dialog");
    if (!dlg) {
        throw ReferenceError("No closest dialog");
    }
    dlg.close();
}

/**
 * Resolves after the browser completes its next layout and paint cycle.
 *
 * @param {function} fun - The callback function
 * @returns {Promise<void>}
 * @throws {TypeError}
 * @throws {RangeError}
 * @category Helpers
 */
export function nextPaint(fun) {
    const tofFun = typeof fun;
    if (tofFun != "function") throw TypeError(`nextPaint, typeof fun == "${tofFun}"`);
    const lenFun = fun.length;
    if (lenFun != 0) throw RangeError(`nextPaint, fun.length == "${lenFun}"`);

    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            queueMicrotask(
                () => {
                    fun();
                    requestAnimationFrame(resolve);
                }
            );
        });
    });
}







/**
 * 
 * @param {string} variableName 
 * @param {string} className 
 * @returns {boolean}
 * @category Helpers
 */
export function isCssVariableDefined(variableName, className) {
    // Ensure the variable name starts with '--'
    const formattedVar = variableName.startsWith('--') ? variableName : `--${variableName}`;

    const testElem = document.createElement('div');
    if (className) {
        testElem.className = className;
    }

    // Isolate the element completely out of the document flow
    testElem.style.position = 'fixed';
    testElem.style.top = '-9999px';
    testElem.style.visibility = 'hidden';

    document.body.appendChild(testElem);

    // Read the computed value of the variable
    const value = window.getComputedStyle(testElem).getPropertyValue(formattedVar).trim();

    document.body.removeChild(testElem);

    // If the variable doesn't exist, the browser returns an empty string
    return value !== '';
}

// Example 1: Check if a global variable exists on a class
// console.log(isCssVariableDefined('--theme-color', 'my-custom-class'));

// Example 2: Check if a global variable exists on the root/body level
// console.log(isCssVariableDefined('--main-bg-color')); 

// Instant, zero-overhead check for global theme variables
/*
const isDefined = window.getComputedStyle(document.documentElement)
                        .getPropertyValue('--my-variable')
                        .trim() !== '';
*/




//////////////////////////////
//// Menus

/**
 * @returns {HTMLDialogElement}
 * @category Visual elements
 */
export function mkDialogMenu() {
    const eltDialogMenuContainer = mkElt("dialog", { class: "menu-container" });
    // The bubbling:
    eltDialogMenuContainer.addEventListener("click", evt => {
        evt.stopPropagation();
        eltDialogMenuContainer.close();
        eltDialogMenuContainer.remove();
    });
    return eltDialogMenuContainer;
}

/**
 * @param {HTMLDialogElement} dialogMenu 
 * @category Visual elements
 */
export function addMenuDivider(dialogMenu) {
    const divider = mkElt("div");
    divider.style = `
    height: 4px;
    background-color: lightgray;
    margin: 0;
    padding: 0;
  `;
    dialogMenu.appendChild(divider);
}
/**
 *
 * @param {HTMLDialogElement} dialogMenu 
 * @param {string} txt 
 * @param {function():void} fun 
 * @throws {TypeError}
 * @throws {RangeError}
 * @category Visual elements
 */
export function addMenuAlt(dialogMenu, txt, fun) {
    if (!(dialogMenu instanceof HTMLDialogElement)) {
        throw TypeError("dialogMenu is not <dialog>");
    }
    if (!(dialogMenu.classList.contains("menu-container"))) {
        throw TypeError("!dialogMenu.menu-container");
    }
    const tofTxt = typeof txt;
    if (tofTxt != "string") {
        if (!(txt instanceof HTMLSpanElement)) {
            // throw Error(`typeof txt: "${tofTxt} != "string`);
            throw TypeError(`Must be string or <span>`);
        }
    }
    if (fun) {
        const tofFun = typeof fun;
        if (tofFun != "function") {
            debugger;
            throw TypeError(`typeof fun: "${tofFun} != "function`);
        }
        if (fun.length > 0) {
            throw RangeError(`function fun should take 0 parameter: ${fun.length}`);
        }
    }

    const alt = mkMenuAlt(txt, fun);
    dialogMenu.appendChild(alt);
    function mkMenuAlt(txt, fun) {
        const btn = mkElt("button", { class: "menu-alt" }, txt);
        if (fun) {
            btn.addEventListener("click", evt => {
                // evt.stopPropagation();
                fun();
            });
        } else {
            /*
            btn.addEventListener("click", evt => {
              evt.stopPropagation();
            });
            */
            btn.disabled = true;
            btn.style.color = "currentColor";
        }
        return btn;
    }
}

/**
 * @param {HTMLDialogElement} dialogMenu
 * @param {Object} objDialogPosition
 * @throws {TypeError}
 * @throws {RangeError}
 * @category Visual helpers
 */
export function displayMenu(dialogMenu, objDialogPosition) {
    const {
        parent,
        relativeX = "right-inner",
        ...rest
    } = objDialogPosition;
    if (Object.keys(rest).length > 0) {
        const unknownKeys = Object.keys(rest).join(", ");
        throw TypeError(
            `Invalid options passed to displayMenu: ${unknownKeys}. ` +
            `Only allowed: parent, relativeX`
        );
    }
    const bcrParent = parent.getBoundingClientRect();
    dialogMenu.style.top = `${bcrParent.bottom}px`;
    switch (relativeX) {
        case "right-inner":
            {
                const distanceFromRightEdge = window.innerWidth - bcrParent.right;
                dialogMenu.style.right = `${distanceFromRightEdge}px`;
            }
            break;
        case "left-inner":
            dialogMenu.style.left = `${bcrParent.left}px`;
            break;
        default:
            throw RangeError(`Bad relativeX == "${relativeX}"`);
    }

    document.body.appendChild(dialogMenu);
    const bcr = dialogMenu.getBoundingClientRect();
    console.log("displayMenu:", { bcr }, dialogMenu);
    if (bcr.x < 0) {
        const right = dialogMenu.style.right;
        // debugger;
        const distanceFromRightEdge = window.innerWidth - bcrParent.right + bcr.x;
        dialogMenu.style.right = `${distanceFromRightEdge}px`;
    }
    dialogMenu.showModal();
    requestAnimationFrame(() => dlg.classList.add("fade-backdrop"));
}


// Global Mobile Viewport & Virtual Keyboard Handler
function OLDmonitorVisualViewPort() {
    console.log("OLDmonitorVisualViewPort");
    snackbar("OLDmonitorVisualViewPort", 8);
    if (window.visualViewport) {
        let isPending = false;

        // 1. The Core Measuring Function
        const globalSyncViewport = () => {
            if (isPending) return;
            isPending = true;

            requestAnimationFrame(() => {
                isPending = false;

                console.log("setting height variables");

                const visualHeight = window.visualViewport.height;
                const totalHeight = window.innerHeight;
                const keyboardHeight = Math.max(0, totalHeight - visualHeight);

                // Write values globally to the root <html> element
                document.documentElement.style.setProperty('--visible-height', `${visualHeight}px`);
                document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
            });
        };

        // 2. Continuous Listeners (Handles orientation flips, zooming, and standard keyboards)
        window.visualViewport.addEventListener('resize', globalSyncViewport);
        window.visualViewport.addEventListener('scroll', globalSyncViewport);

        // Initialize the values immediately on page load
        globalSyncViewport();

        // 3. Global Fallback for GBoard / Stuck Focus Bugs
        // Captures taps on any input or editable field globally
        document.addEventListener('pointerup', (event) => {
            const el = event.target;
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;

            if (isInput) {
                // Short delay lets GBoard finish sliding out before measuring
                setTimeout(globalSyncViewport, 150);
            }
        });
    }
}
// OLDmonitorVisualViewPort();


let resizeTimeout;
function syncViewport() {
    // Clear any pending debounced checks
    if (resizeTimeout) clearTimeout(resizeTimeout);

    const visualHeight = window.visualViewport.height;
    const totalHeight = window.innerHeight;

    // We add a tiny buffer (like 15px) because zoom or subpixel rendering 
    // can make innerHeight and visualViewport.height differ slightly even without a keyboard.
    const keyboardHeight = (totalHeight - visualHeight > 15) ? (totalHeight - visualHeight) : 0;

    document.documentElement.style.setProperty('--visible-height', `${visualHeight}px`);
    document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
};


// Suggested by Gemini:
function monitorVisualViewport() {
    if (!window.visualViewport) return;

    // let resizeTimeout;

    const OLDsyncViewport = () => {
        // Clear any pending debounced checks
        if (resizeTimeout) clearTimeout(resizeTimeout);

        const visualHeight = window.visualViewport.height;
        const totalHeight = window.innerHeight;

        // We add a tiny buffer (like 15px) because zoom or subpixel rendering 
        // can make innerHeight and visualViewport.height differ slightly even without a keyboard.
        const keyboardHeight = (totalHeight - visualHeight > 15) ? (totalHeight - visualHeight) : 0;

        document.documentElement.style.setProperty('--visible-height', `${visualHeight}px`);
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    };

    // 1. Listen to the native viewport events
    window.visualViewport.addEventListener('resize', () => {
        // syncViewport();
        // Safety Net: Keyboards on mobile (especially iOS & GBoard) often report 
        // intermediate sizes mid-animation. This ensures we catch the absolute final state.
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            syncViewport();
            const eltScroll = document.querySelector("dialog div.scroll-for-text-input");
            if (!eltScroll) return;
            const dlg = eltScroll.closest("dialog")
            if (!dlg) {
                debugger;
            }
            scrollForTextInput(dlg, 999);
        }, 100);
    });

    // window.visualViewport.addEventListener('scroll', syncViewport);

    // 2. Catch focus loss / keyboard dismissal
    // Tapping outside an input or pressing "done" needs to trigger a recalculation
    document.addEventListener('focusout', () => {
        // Small timeout gives the keyboard time to begin collapsing
        setTimeout(syncViewport, 100);
    });

    // Initial calculation
    // syncViewport();
    setTimeout(syncViewport, 500);
}



/**
 * @param {HTMLDialogElement} dlg
 * @param {number} msTimeout
 * @throws {ReferenceError}
 * @throws {TypeError}
 */
function scrollForTextInput(dlg, msTimeout = 300) {
    if (!(dlg instanceof HTMLDialogElement)) throw TypeError("not dialog elment");
    // if (!dlg.classList.contains("has-text-input")) return;
    setTimeout(() => {
        console.log("using textInput");
        const eltScroll = dlg.querySelector("div.scroll-for-text-input");
        if (!eltScroll) throw ReferenceError("!eltScroll");
        if (!(eltScroll instanceof HTMLDivElement)) throw Error("eltScroll is not div");
        syncViewport();
        eltScroll.scrollIntoView({ behavior: "smooth", block: "start" });
    }, msTimeout);
}


/**
* Waits for a list of elements to settle their layouts.
* @param {HTMLElement|HTMLElement[]|NodeList} elements - Single element or list of elements.
* @returns {Promise<WeakMap<HTMLElement, ResizeObserverEntry>>} Resolves with a WeakMap mapping elements to their final entries.
 * @category Helpers
*/
export function waitForLayoutSilence(elements) {
    return new Promise((resolve) => {
        // Normalize input to an array so we can safely loop over it
        const targets = elements instanceof NodeList || Array.isArray(elements)
            ? Array.from(elements)
            : [elements];

        let rafId = null;

        // Create the WeakMap that will be passed back to the user
        const latestEntries = new WeakMap();

        const observer = new ResizeObserver((entries) => {
            // 1. Map the element directly to its latest resize data
            for (let entry of entries) {
                // latestEntries.set(entry.target, entry.contentRect);
                latestEntries.set(entry.target, entry.target.getBoundingClientRect());
            }

            // 2. Clear previous frame schedule if layout is still moving
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            // 3. Wait for one full frame of silence
            rafId = requestAnimationFrame(() => {
                observer.disconnect();

                // 4. Resolve the Promise directly with the WeakMap
                resolve(latestEntries);
            });
        });

        // Start observing all targeted elements
        targets.forEach(el => observer.observe(el));
    });
}

monitorVisualViewport();



/**
 * @param {string} cssVar -- 500ms, 0.5s
 * @returns {number}
 * @throws {SyntaxError}
 * @category Helpers
 */
export function getRootCssVarMs(cssVar) {
    if (!cssVar.startsWith("--")) {
        debugger;
        throw SyntaxError(`${cssVar} is not a css variable name`);
    }
    let strCssVar =
        window.getComputedStyle(document.documentElement)
            .getPropertyValue(cssVar)
            .trim();
    if (strCssVar.length == 0) {
        debugger;
        throw SyntaxError(`${cssVar} not set on :root`);
    }
    const isSec = strCssVar.endsWith("s");
    const isMs = strCssVar.endsWith("ms");
    if (!isSec) {
        debugger;
        throw SyntaxError(`${cssVar} does not end with ms or s`);
    }
    strCssVar = strCssVar.slice(0, -1);
    if (isMs) { strCssVar = strCssVar.slice(0, -1); }
    if (strCssVar.endsWith(" ")) {
        debugger;
        throw SyntaxError(`${cssVar} space before ms`);
    }
    if (Number.isNaN(Number(strCssVar))) {
        debugger;
        throw SyntaxError(`${cssVar} does not have a number`);
    }
    let ms = parseFloat(strCssVar);
    if (!isMs) { ms = 1000 * ms; }
    return ms
}




/////////////////
//// Color themes


/**
 * Converts any valid CSS color string (name, rgb, hsl) to a hex string.
 * @param {string} colorName - e.g., "orange", "deepskyblue", "papayawhip"
 * @returns {string|null} Hex color string (e.g., "#f97316") or null if invalid
 * @category Helpers
 */
// FIX-ME: This is also in basic-ui-color-themes
export function colorNameToHex(colorName) {
    // Create an in-memory 1x1 canvas context
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;

    // ctx.fillStyle = colorName;
    // const computed = ctx.fillStyle;



    // 1. Set to a baseline color
    ctx.fillStyle = "#000000";
    ctx.fillStyle = colorName;

    // If assigning colorName failed and it didn't compute to black, it's invalid
    const computedFirst = ctx.fillStyle;

    // 2. Double-check against a second baseline to verify actual black input vs fallback
    ctx.fillStyle = "#ffffff";
    ctx.fillStyle = colorName;
    const computedSecond = ctx.fillStyle;

    // If the fillStyle didn't change with colorName, the input string is invalid
    if (computedFirst !== computedSecond) {
        return null;
    }

    const computed = computedFirst;




    // Browser resolves valid colors to hex "#rrggbb" or "rgba(...)"
    if (computed.startsWith("#")) {
        return computed;
    }

    // Handle rgb(r, g, b) return values from canvas
    const rgbMatch = computed.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
        const [r, g, b] = rgbMatch.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    return null;
}




// Example usage:
// console.log(colorNameToHex("orange"));       // "#ffa500"
// console.log(colorNameToHex("coral"));        // "#ff7f50"
// console.log(colorNameToHex("teal"));         // "#008080"
// console.log(colorNameToHex("invalidname"));  // null

// Example Usage:
// applyMaterialTheme("#f97316"); // Generates and applies the Orange theme
// applyMaterialTheme("#00ff00");
// applyMaterialTheme("yellow", true);



/////////////
// Snackbars
/////////////

/**
 * @returns {HTMLDivElement}
 * @throws {ReferenceError}
 */
function getEltSnackbar() {
    let elt = document.getElementById("snackbar");
    if (!elt) {
        // Native popover element configured manually so it doesn't light-dismiss
        elt = mkElt("div", {
            id: "snackbar",
            popover: "manual",
            // class: "inverse-primary"
            class: "surface"
        });
        if (elt == null) { throw ReferenceError("elt == null"); }
        elt.addEventListener("click", evt => {
            evt.stopPropagation();
            toast.clearQueue();
        });
        elt.dataset.state = "closed";
        document.body.appendChild(elt);
    }
    return /** @type {HTMLDivElement} */ (elt);
}

/*
class SnackbarQueue {
    constructor() {
        this.snackbarPopover = getEltSnackbar();
        // this.queue = /** @type {string[]} * / [];
        /** @type {string[]} * /
        this.queue = [];
        this.isDisplaying = false;

        // Allow clicking to dismiss early
        this.snackbarPopover.addEventListener('click', () => this.dismissCurrent());
    }

    /**
     * @param {string|HTMLDivElement} message
     * @param {number} duration
     * /
    showBar(message, duration = 3000) {
        // Avoid queuing duplicate back-to-back messages
        if (this.queue.some(item => item.message === message)) return;

        this.queue.push({ message, duration });
        if (!this.isDisplaying) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isDisplaying = false;
            console.log("processQueue: snackbar queue was empty");
            return;
        }

        this.isDisplaying = true;
        const { message, duration } = this.queue.shift();
        // console.log("processQueue: snackbar duration", duration);

        // Set text directly on the popover container
        this.snackbarPopover = getEltSnackbar();
        this.snackbarPopover.textContent = "";
        this.snackbarPopover.append(message);
        this.snackbarPopover.showPopover();

        // Wait for display duration or manual click
        await new Promise((resolve) => {
            this.currentResolver = resolve;
            this.timeoutId = setTimeout(resolve, duration);
        });



        // From Gemini:
        dismissSnackbar(this.snackbarPopover);
        async function dismissSnackbar(popoverEl) {
            // Play the Material Design fast exit animation
            const animation = popoverEl.animate([
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(calc(100% + 2rem))' }
            ], {
                duration: 2000,
                easing: 'cubic-bezier(0.3, 0, 1, 1)'
            });

            // Wait for animation to finish before native hide
            await animation.finished;
            popoverEl.hidePopover();
            popoverEl.remove();
        }




        // Brief pause for CSS fade-out before showing the next snackbar
        setTimeout(() => this.processQueue(), 150);
    }

    dismissCurrent() {
        console.log("SnackbarQueue, dismissCurrent");
        if (this.currentResolver) {
            clearTimeout(this.timeoutId);
            this.currentResolver();
        }
    }

    clearQueue() {
        console.log("SnackbarQueue, clearQueue");
        this.queue.length = 0;
        this.dismissCurrent();
        this.snackbarPopover.hidePopover();
    }
}

// Usage:
const toast = new SnackbarQueue();
// toast.show('Microphone enabled');




/**
 * @param {string|HTMLDivElement} message
 * @param {number} duration
 *
 * @category Visual elements
 * @example
 *   snackbar('Microphone enabled');
 * /
export function snackbar(message, duration) {
    toast.showBar(message, duration);
}

export function clearSnackbarQueue() {
    toast.clearQueue();
}

// Module-level variable to track the active timer
let tmrSnackbar = null;
*/

// const snackbar = document.querySelector('#snackbar');

/**
 * @param {string|HTMLSpanElement} msg
 * @param {number} [secDur]
 */
export function snackbar(msg, secDur = 4) {
    showSnackbar(msg, secDur);
}

/**
 * @param {string|HTMLSpanElement} msg
 * @param {number} secDur
 */
function showSnackbar(msg, secDur) {
    console.log("showSnackbar");
    setTimeout(() => hideSnackbar(), secDur * 1000);
    const snackbar = getEltSnackbar();
    snackbar.textContent = "";
    const eltMsg = (typeof msg == "string") ? mkElt("span", undefined, msg) : msg;
    snackbar.appendChild(eltMsg);
    snackbar.dataset.state = 'opening';
    snackbar.showPopover();
    console.log({ snackbar });
    console.log(snackbar.dataset.state);
    console.log(getComputedStyle(snackbar).animationName);

    snackbar.addEventListener('animationend', function onAnimationEnd(event) {
        console.log("snackbar at animationend");
        if (event.animationName !== 'snackbar-opening') return;
        console.log("snackbar at animationName == snackbar-opening");


        snackbar.removeEventListener('animationend', onAnimationEnd);
        snackbar.dataset.state = 'open';
    });
}

function hideSnackbar() {
    const snackbar = getEltSnackbar();
    snackbar.dataset.state = 'closing';

    snackbar.addEventListener('animationend', function onAnimationEnd(event) {
        if (event.animationName !== 'snackbar-closing') return;

        snackbar.removeEventListener('animationend', onAnimationEnd);
        snackbar.dataset.state = 'closed';
        snackbar.hidePopover();
    });
}
setTimeout(() => { snackbar("Hi, welcome!", 2); }, 700);
// setTimeout(() => { snackbar("Sorry!", 2); }, 2000);
/*
setTimeout(() => {
    const elt = mkElt("span", undefined, "Hi again...");
    elt.style.color = "red";
    snackbar(elt);
}, 500);
*/