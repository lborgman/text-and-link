// @ts-check

// @ts-ignore
const mkElt = window["mkElt"];
// @ts-ignore
const errorHandlerAsyncEvent = window["errorHandlerAsyncEvent"];

navigator.serviceWorker.register('./sw.js');

export { };

const modBasicUI = await import("https://lborgman.github.io/basic-ui/js/basic-ui.js");

const storagePrefix = "clean-link";
const keyTheme = `${storagePrefix}-theme`;

/**
 * @typedef {Object} ColorTheme
 * @property {string} color - CSS color
 * @property {boolean} dark
 */

function saveTheme() {
    const strJson = JSON.stringify(currentTheme);
    localStorage.setItem(keyTheme, strJson);
}
/**
 * @returns {ColorTheme}
 */
function retrieveTheme() {
    const strJson = localStorage.getItem(keyTheme);
    if (strJson == null) {
        return { color: "red", dark: true }
    }
    const objJson = JSON.parse(strJson)
    return objJson;
}
function resetTheme() {
    localStorage.removeItem(keyTheme);
    currentTheme = retrieveTheme();
}


/** @type {ColorTheme} */
let currentTheme = retrieveTheme();
applyCurrentTheme();
function applyCurrentTheme() {
    modBasicUI.applyMaterialTheme(currentTheme.color, currentTheme.dark);
}

// console.log({ modBasicUI });
// debugger;

// Check snackbar transition-duration, takes less than 0.5ms
// const msSnackTransDur = modBasicUI.getCssVarMs("--snack-trans-dur");
// console.log({ snackTransDur: msSnackTransDur });
// if (msSnackTransDur > 2000) { throw Error(`--snack-trans-dur > 2000ms`); }



const divOutput = document.getElementById("output");
const divOutputText = document.getElementById("output-text");
const divOutputLink = document.getElementById("output-link");
const taLink = /** @type {HTMLTextAreaElement} */ (document.getElementById("ta-link"));
if (!taLink) throw Error("Did not find ta-Link");
taLink.addEventListener("input", _evt => {
    handleInputLink();
});
taLink.addEventListener("change", _evt => {
    handleInputLink();
});
function handleInputLink() {
    if (!(taLink instanceof HTMLTextAreaElement)) { throw Error("taLink is not textarea"); }
    const strIn = taLink.value.trim();
    if (!canBeWebUrl(strIn)) {
        if (!(divOutputLink instanceof HTMLDivElement)) { throw Error("divOutputLink is not div"); }
        divOutputLink.textContent = "";
        const eltCleanedInfo = document.getElementById("cleaned-info");
        if (!eltCleanedInfo) throw Error("!eltCleanedInfo");
        eltCleanedInfo.textContent = "(Can't be a valid url)";
        return;
    }
    const eltOutput = document.getElementById("output");
    if (eltOutput?.hasAttribute("style")) { eltOutput.removeAttribute("style"); }

    /** @type {string[]} */
    const advIds = [];
    const strOut1 = removeTrailIds(strIn, advIds);
    const strOut = removeByPattern(strOut1, advIds);
    console.log(strOut, advIds);
    const numCleaned = advIds.length;
    const eltCleanedInfo = document.getElementById("cleaned-info");
    if (!eltCleanedInfo) throw Error("!eltCleanedInfo");
    if (numCleaned == 0) {
        if (0 == strOut.length) {
            eltCleanedInfo.textContent = "";
        } else {
            eltCleanedInfo.textContent = `Found no click identifiers`;
        }
    } else {
        eltCleanedInfo.textContent = `Removed ${numCleaned} click identifiers:`;

        const btnCleanedInfo = mkElt("button", { id: "btn-cleaned-info" }, "Details");
        eltCleanedInfo.appendChild(btnCleanedInfo);
        btnCleanedInfo.addEventListener("click",
            /** @param {PointerEvent} evt */ evt => {
                evt.stopPropagation();
                btnCleanedInfo.remove();
                const divCleanedDetails = mkElt("div", { id: "div-cleaned-details" });
                advIds.sort().forEach(id => {
                    console.log("removed ", id);
                    divCleanedDetails.appendChild(mkElt("div", undefined, `Removed ${id}`));
                });
                const divExpandingCleanedInfo = mkExpandable(divCleanedDetails);
                const eltCleanedInfo = document.getElementById("cleaned-info");
                if (!eltCleanedInfo) throw Error("!eltCleanedInfo");
                if (!eltCleanedInfo.parentElement) throw Error("!eltCleanedInfo.parentElement");

                // eltCleanedInfo.parentElement.insertBefore(divExpandingCleanedInfo, eltCleanedInfo.nextElementSibling);
                eltCleanedInfo.appendChild(divExpandingCleanedInfo);

                console.log({ eltCleanedInfo, divExpandingCleanedInfo });
                setTimeout(() => { divExpandingCleanedInfo.classList.add("expanded") }, 10);
            });
    }


    if (divOutputLink == null) { throw Error("divOutputLink == null"); }
    divOutputLink.textContent = "";
    const href = strOut;
    const eltA = mkElt("a", { href, style: "word-wrap:anywhere;" }, href);
    divOutputLink.appendChild(eltA);

}
const btnCopy = document.getElementById("btn-copy");
if (btnCopy == null) throw Error("btnCopy == null");
btnCopy.addEventListener("click", errorHandlerAsyncEvent( /** @param {PointerEvent} evt */ async evt => {
    const isDelayedClick = evt.isDelayedClick;
    // console.log("======= btnCopy click", { isDelayedClick });
    if (divOutputText == null) throw Error("divOutputText == null");
    const text = divOutputText.textContent;
    if (divOutputLink == null) throw Error("divOutputLink == null");
    const link = divOutputLink.textContent;
    if (text.length + link.length == 0) {
        // clearSnackbars();
        tellUser("Nothing to copy");
        return;
    }
    const allText = `${text}\n${link}`;
    // console.log({ text, link, allText });
    try {
        await navigator.clipboard.writeText(allText);
        // const elt = mkElt("div", { style: "NOmax-width: clamp(160px, 400px, 70dvw);" }, [
        const elt = mkElt("div", { style: "padding:8px" }, [
            mkElt("i", { style: "color:green;" }, "Copied:"),
            mkElt("pre", { style: " overflow-wrap: anywhere; white-space: pre-wrap; " }, allText)
        ]
        );
        // clearSnackbars();
        tellUser(elt);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(errorMessage, { cause: err });
    }
    function tellUser(message) {
        if (typeof message == "string") {
            // Nothing was copied
            showSnackbar(message);
            return;
        }
        // On Android there is very good default feedback when copying.
        if (isAndroid()) {
            const bcr = btnCopy.getBoundingClientRect();
            showHere(bcr.left, bcr.top + bcr.height, "Copied", 1.5);
            return;
        }
        showSnackbar(message);
    }
}));
btnCopy.addEventListener("NOclick", evt => {
    alert("btnCopy");
    evt.stopPropagation();
    console.log("btnCopy");
});

/**
 * @param {URL} urlIn
 * @param {string} param
 * @returns {URL}
 */
function removeUrlParam(urlIn, param) {
    if (!(urlIn instanceof URL)) { throw Error(`urlIn is not URL`); }
    const urlOut = new URL(urlIn);
    urlOut.searchParams.delete(param);
    return urlOut;
}

/**
 * 
 * @param {string} strUrl 
 * @param {string[]} advIds 
 * @returns {string}
 */
function removeByPattern(strUrl, advIds) {
    /** @type {URL} */ let url;
    try {
        url = new URL(strUrl);
    } catch (err) {
        console.error(err);
        return "";
    }
    console.log({ url });
    const arrNames = [...url.searchParams].map(p => { return p[0]; });
    arrNames.forEach(n => {
        if (n.startsWith("utm_")) {
            console.log({ n });
            url = removeUrlParam(url, n);
            advIds.push(n);
        }
    });
    return url.href;
}
/**
 * @param {string} strUrl
 * @param {string[]} advIds 
 * @returns {string}
 */
function removeTrailIds(strUrl, advIds) {
    // https://en.wikipedia.org/wiki/Click_identifier
    const knownClickIds = [
        // DoubleClick Click Identifier (dclid), used by Google Marketing Platform
        "dclid",
        // Facebook Click Identifier (fbclid) used by Meta Platforms in advertising and social media analytics
        "fbclid",
        // Google Click Identifier (gclid, gclsrc, wbraid and gbraid), used by Google Ads and Google Marketing Platform
        "gclid", "gclsrc", "wbraid", "gbraid",
        // LinkedIn Click Identifier (li_fat_id), used by LinkedIn Ads
        "li_fat_id",
        // Microsoft Click Identifier (msclkid), used by Microsoft Advertising
        "msclkid",
        // Seznam Click Identifier (sznclid), used by Seznam / Sklik
        "sznclid",
        // TikTok Click Identifier (ttclid), used by TikTok Ads
        "ttclid",
        // Twitter Click Identifier (twclid), used by X Ads
        "twclid",
        // Yahoo Click Identifier (yclid), used by Yahoo! Japan Ads
        "yclid",
        // Yandex Click Identifier (yclid), used by Yandex Direct advertising
        "yclid",
        // Zanox click identifier (zanpid), used by Awin
        "zanpid",
    ];
    /** @type {URL} */ let url;
    try {
        url = new URL(strUrl);
    } catch (err) {
        console.log({ err })
        // return err.message;
        return "";
    }
    knownClickIds.forEach(clickId => {
        const hrefIn = url.href;
        url = removeUrlParam(url, clickId);
        const hrefOut = url.href;
        if (hrefIn != hrefOut) {
            if (url.searchParams.has(clickId)) {
                advIds.push(clickId);
            }
        }
    });
    return url.href;
}

{
    // (async () => {
    // For me to remember:
    // https://chatgpt.com/share/6a62268a-17a8-83eb-acbe-0c86961a23c4
    const modShPar = await import("./sharing-params.js");

    const eltLogo = document.getElementById("logo");
    if (!eltLogo) throw Error("!eltLogo");
    eltLogo.addEventListener("click", evt => {
        evt.stopPropagation();
        showHelp();
    })

    const sharedParams = modShPar.getOurSharedParams();
    console.log({ sharedParams });
    if (sharedParams) {
        // const divText = mkElt("div", { id: "text-content" });
        const divText = document.getElementById("output-text");
        if (!divText) { throw Error("Did not find output-text"); }
        if (sharedParams.title) {
            const div = mkElt("div", undefined, sharedParams.title);
            div.style.fontWeight = "bold";
            divText.appendChild(div);
        }
        if (sharedParams.text) {
            const div = mkElt("div", undefined, sharedParams.text + "\n");
            divText.appendChild(div);
        }
        if (sharedParams.url) {
            taLink.value = sharedParams.url;
            handleInputLink();
        }
    }
    const isInstalled = await isPWAInstalled();
    switch (isInstalled) {
        case true:
            document.documentElement.classList.add("pwa-is-installed");
            removeDialogCanInstall();
            break;
        case false:
            document.documentElement.classList.add("pwa-is-not-installed");
            break;
        case undefined:
            break;
        default:
            throw Error(`isInstalled == "${isInstalled}"`);
    }
    // })();
}

if (isAndroid()) {
    document.documentElement.classList.add("is-android");
    // FIX-ME: We have checked before if it is in the DOM!
    const d = /** @type {HTMLDialogElement} */ (document.getElementById("can-be-installed"));
    if (d) {
        addXclose(d);
        d.showModal();
    }
}

// FIX-ME: experimental
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps
// https://caniuse.com/mdn-api_navigator_getinstalledrelatedapps

// These checks are pretty useless:
function OLDhasParamInstalled() {
    // Checking installed: This only works during installation. Useless unless you save it.
    const paramName = "cleanlink_is_installed";
    const val = new URLSearchParams(window.location.search).get(paramName);
    return val === 'pwa';
}
async function OLDcheckInstalledRelatedApps() {
    // Checking installed: Not reliable yet
    if ('getInstalledRelatedApps' in navigator) {
        /** @type {Array<{platform: string}>} */
        const relatedApps = await (/** @type {any} */(navigator)).getInstalledRelatedApps();

        // Filter to see if your webapp platform is in the list
        /** @type {boolean} */
        const isInstalled = relatedApps.some(app => app.platform === 'web');
        console.log(`isInstalled==${isInstalled}`);
        if (isInstalled) {
            debugger;
            console.log("PWA is installed!");
            return true;
        } else {
            console.log("PWA is not installed.");
            return false;
        }
    } else {
        console.log("The getInstalledRelatedApps API is not supported.");
        return;
    }
}

async function isPWAInstalled() {
    // debugger;
    return isDisplayModePWA();
}

/**
 * @param {HTMLElement} eltContent
 * @returns {HTMLDivElement}
 */
function mkExpandable(eltContent) {
    return mkElt("div", { class: "expandable-wrapper" }, [
        mkElt("div", { class: "expandable-content" }, eltContent)
    ]);
}


// @ts-ignore
window.showHelp = showHelp;
async function showHelp() {
    const urlHelp = "https://lborgman.github.io/text-and-link/";
    const html = await fetch(urlHelp).then(r => r.text());
    // const htmlGH = html.replaceAll('"/', '"https://lborgman.github.io/');
    const tempDiv = /** @type {HTMLDivElement} */ (document.createElement('div'));
    tempDiv.innerHTML = html;
    removeHtmlHeaderElements();
    function removeHtmlHeaderElements() {
        [...tempDiv.children].forEach(element => {
            if ([
                "META",
                "TITLE",
                "SCRIPT",
                "LINK",
                "STYLE",
            ].includes(element.tagName)) {
                element.remove();
            }
        });
        // return tempDiv.innerHTML;
    }
    // FIX-ME: This is for jekyll-theme-midnight
    const ourCss = `
        dialog#show-help-dialog[open] {
            background-color : #252525;
            color : #e8e8e8;
            a {
                color : #ffcc00;
            }
            /* Resets the default browser push */
            ul, ol {
                padding-left: 20px; /* Reduces the 40px default by half */
                margin-left: 0;
            }
            #header {
                display: none;
            }
            #title {
                display: none;
            }
        }
    `;
    const ourStyle = document.createElement("style");
    ourStyle.textContent = ourCss;
    const fullDiv = document.createElement("div");

    // The style will be added when the dialog is opened and removed when closed
    fullDiv.appendChild(ourStyle);
    fullDiv.appendChild(tempDiv);

    const dlg = showHtmlAsDialog(tempDiv.innerHTML, {
        css: ourCss,
        script: scriptAddShowHelpClickFun,
    });

    dlg.id = "show-help-dialog";
}

/**
 * @param {string} pageTitle 
 */
async function showWikipediaAsDialog(pageTitle) {
    const htmlOrig = await fetchWikiArticle(pageTitle);
    const div = mkElt("div");
    div.innerHTML = htmlOrig;
    console.log({ div });
    // debugger;
    const eltMeta = div.querySelector("table.metadata");
    eltMeta?.remove();
    const html = div.innerHTML;
    // color: "blue",
    // color: "#2563EB",
    const color = "#0284C7";
    const dlg = showHtmlAsDialog(html, {
        script: scriptAddtWikipediaClickFun,
        css: "dialog[open] { padding-top:40px; }",
        theme: {
            color,
            dark: currentTheme.dark,
        }
    });
    // debugger;
    dlg.style.border = `2px solid ${color}`;
}
window.showWikipediaAsDialog = showWikipediaAsDialog;

/**
 * Fetches the HTML content of a Wikipedia article.
 * @param {string} pageTitle - The title of the article (e.g., "Progressive_web_app" or "JavaScript").
 * @param {string} [lang='en'] - The language code for Wikipedia (defaults to 'en').
 * @returns {Promise<string>} - Resolves to the article's HTML content.
 */
async function fetchWikiArticle(pageTitle, lang = 'en') {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&format=json&formatversion=2&origin=*`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Wikipedia API error: ${data.error.info}`);
        }

        return data.parse.text;
    } catch (error) {
        console.error(`Failed to fetch article "${pageTitle}":`, error);
        throw error;
    }
}




////////////////
////// basic-ui
// - FIX-ME: copy all of those into basic-ui.js
// - FIX-ME: import basic-ui.js instead??? Move
////////////////


///////////////////////////
///// Dialogs

/**
 * @param {function} [funClose]
 * @returns {HTMLButtonElement}
 */
function mkXclose(funClose) {
    const xClose = mkElt("button", { class: "x-close", title: "- Close" }, "✖");
    xClose.addEventListener("click",
            /** @param {PointerEvent} evt */ evt => {
            evt.stopPropagation();
            if (funClose) {
                funClose();
                return;
            }
            (xClose.closest("dialog"))?.close();
        });
    return xClose;
}





/**
 * @param {DOMRect} rect
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function isPointInside(rect, x, y) {
    return x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom;
};


/*
// Just keep the code to remember, using tempDiv is a nice hack
function OLDreplaceAnchorsWithSpans(htmlString) {
    try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
 
        const anchors = tempDiv.querySelectorAll('a');
 
        anchors.forEach(anchor => {
            const href = anchor.getAttribute("href");
            if (href == null) { return; }
            const isInternalLink = href.startsWith("#");
            if (!isInternalLink) {
                console.log("REPLACE:", href);
                const span = document.createElement('span');
                span.classList.add("replaced-a")
 
                // Copy all attributes
                for (const attr of anchor.attributes) {
                    span.setAttribute(attr.name, attr.value);
                }
 
                // Copy child nodes (preserving DOM structure)
                while (anchor.firstChild) {
                    span.appendChild(anchor.firstChild);
                }
 
                anchor.parentNode.replaceChild(span, anchor);
            } else {
                console.log("not replaced:", href);
            }
        });
 
        return tempDiv.innerHTML;
    } catch (error) {
        console.error('Error replacing anchors:', error);
        return htmlString; // Return original on error
    }
}
*/



/**
 * @param {string} string 
 * @returns {boolean}
 */
function canBeWebUrl(string) {
    if (!URL.canParse(string)) return false;

    const url = new URL(string);

    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
    if (!hostnameRegex.test(url.hostname)) return false;

    // Enforces a literal dot followed by 2 to 63 alphanumeric ASCII/Punycode characters
    const tldRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z0-9]{2,63}$/i;
    if (!tldRegex.test(url.hostname)) return false;

    return true;
}


/** @param {PointerEvent} evt */
function getAHref(evt) {
    let targetA = /** @type {HTMLElement} */ (evt.target);
    if (targetA == null) throw Error("targetA==null");
    if (targetA.tagName != "A") {
        const newA = targetA.closest("a");
        if (!newA) { return; }
        targetA = newA;
    }
    const href = targetA.getAttribute("href");
    console.log({ targetA, href });
    return href;
}

/** @param {PointerEvent} evt */
function handleWikipediaClick(evt) {
    const href = getAHref(evt);
    if (!href) { return; }
    if (href.startsWith("#")) { return; }
    evt.stopPropagation();
    evt.preventDefault();
    const mWiki = href.match(new RegExp("^(?:https://en.wikipedia.org)?/wiki/(.*)$"));
    if (mWiki) {
        const wikiTitle = mWiki[1];
        showWikipediaAsDialog(wikiTitle);
        return;
    }
    let target = /** @type {HTMLElement} */ (evt.target);
    if (target == null) throw Error("target==null");
    const targetA = target.closest("a");
    if (targetA == null) throw Error("targetA,2==null");
    const txtA = targetA.textContent
    showHere(evt.clientX + 30, evt.clientY - 40, `Can't "${txtA}" this here`, 3);
}

/** @param {HTMLDialogElement} dialog */
function scriptAddtWikipediaClickFun(dialog) {
    dialog.addEventListener("click", evt => handleWikipediaClick(evt));
}

/** @param {HTMLDialogElement} dialog */
function scriptAddShowHelpClickFun(dialog) {
    const handleOnThisUrl = /** @param {PointerEvent} evt */ (evt) => {
        const baseUrl = location.origin + location.pathname;
        const hrefEvt = getAHref(evt);
        if (baseUrl == hrefEvt) {
            evt.preventDefault();
            evt.stopPropagation();
            // const div = showHere(evt.clientX, evt.clientY, "You are already there!");
            // setTimeout(() => div.remove(), 3000);
            showHere(evt.clientX, evt.clientY, "You are already there!", 3);
            return true;
        }
        return false;
    }
    dialog.addEventListener("click",/** @param {PointerEvent} evt */(evt) => {
        if (handleOnThisUrl(evt)) { return; }
        handleWikipediaClick(evt);
    });
}

function removeDialogCanInstall() {
    const dlg = document.getElementById("can-be-installed");
    if (!dlg) { throw Error('Did not find "can-be-installed"'); }
    dlg.remove();
}







////////////////////
/////// UI-basic
////////////////////


////// Popover

/**
 * Show as popover
 *
 * @param {string|HTMLDivElement} txtOrDiv
 * @param {number} [secTimeout]
 * @param {number} [clientX]
 * @param {number} [clientY]
 *
 * @return {HTMLDivElement}
 */
function showOver(txtOrDiv, secTimeout, clientX, clientY) {
    // Both must be number or undefined
    const hasPos = clientX != undefined && clientY != undefined;
    if (hasPos) {
        if (Number.isNaN(clientX) || Number.isNaN(clientY)) {
            throw Error(`Bad pos: (${clientX}, ${clientY})`);
        }
    }
    const div = mkElt("div", { class: "snackbar" }, txtOrDiv);
    div.setAttribute("popover", "");
    document.documentElement.appendChild(div);
    if (hasPos) {
        const bcr = div.getBoundingClientRect();
        const wW = window.innerWidth;
        const wH = window.innerHeight;
        if (bcr.right > wW) {
            clientX = wW - bcr.width;
            div.style.left = `${clientX}px`;
        }
        if (bcr.bottom > wH) {
            clientY = wH - bcr.height;
            div.style.top = `${clientY}px`;
        }
    }
    div.showPopover();
    if (hasPos) {
        div.style.margin = `0`;
        div.style.position = `fixed`;
        div.style.left = `${clientX}px`;
        div.style.top = `${clientY}px`;
    }
    if (secTimeout == undefined) return div;
    setTimeout(() => {
        div.remove();
    }, secTimeout * 1000);
    return div;
}
/**
 * Show txt popup-style in the snackbar position of the screen
 * @param {string|HTMLDivElement} txtOrDiv
 * @param {number} msShow
 */
function showSnackbar(txtOrDiv, msShow = 4000) {
    return modBasicUI.snackbar(txtOrDiv, msShow);
    // return showOver(txtOrDiv, 3);
}
function clearSnackbars() {
    console.log("clearSnackbars");
    // return; // FIX-ME: to do or not to do
    // This is a bit broken:
    modBasicUI.clearSnackbarQueue();
}

/**
 * Show txt popup-style at a certain point.
 * Popup is guaranteed to be entirely inside viewport.
 *
 * Uses CSS class "show-here".
 *
 * @param {number} clientX
 * @param {number} clientY
 * @param {string|HTMLDivElement} txtOrDiv
 * @param {number} [secTimeout]
 * @returns {HTMLDivElement}
 */
function showHere(clientX, clientY, txtOrDiv, secTimeout) {
    return showOver(txtOrDiv, secTimeout, clientX, clientY);
}

// Remove popover without id on rim click
document.addEventListener('toggle', (event) => {
    if (!event.target) { return; }
    if (event.target.id) { return; }
    const target = /** @type {HTMLElement} */ (event.target);
    if (event.newState === 'closed' && target.hasAttribute('popover')) {
        target.remove();
    }
}, true); // Using capture phase handles all edge cases smoothly




//// Dialog
/**
 * @param {HTMLDialogElement} dialog 
 * @returns {HTMLButtonElement}
 */
function addXclose(dialog) {
    const btnClose = dialog.querySelector("button[class=x-close]");
    if (btnClose) {
        if (!(btnClose instanceof HTMLButtonElement)) throw Error("btnClose it not button");
        return btnClose;
    }
    const elt = mkXclose(() => closeDialog(dialog));
    // dialog.appendChild(elt);
    dialog.insertBefore(elt, dialog.firstElementChild);
    return elt;
}

/*
document.documentElement.addEventListener("click", evt => {
    const dialog = evt.target;
    if (dialog instanceof HTMLDialogElement) {

        const rect = dialog.getBoundingClientRect();
        if (isPointInside(rect, evt.clientX, evt.clientY)) {
            return;
        }
        const scrollbarWidth = dialog.offsetWidth - dialog.clientWidth;
        const xFromRight = rect.right - evt.clientX;

        // Ignore if click is in scrollbar area
        if (xFromRight <= scrollbarWidth && xFromRight > 0) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();
        closeDialog(dialog);
    }
    // const currentTarget = evt.currentTarget;
    // const onDialog = dialog == currentTarget;
    // if (onDialog) dialog.close();
});
*/

/**
 * @param {HTMLDialogElement} dialog
 */
function closeDialog(dialog) {
    // console.log("closeDialog", dialog);
    dialog.close();
    if (!dialog.classList.contains("html-dialog")) {
        // console.log("closeDialog remove");
        dialog.remove();
    }
}



//// For PWA (you can't open external urls)

/**
 * @param {string} url 
 */
async function showUrlAsDialog(url) {
    const html = await fetch(url).then(r => r.text());
    console.log({ html });
    // document.getElementById("helpContent").innerHTML = html;
    const dialogId = "helpContent";
    let dialog = /** @type {HTMLDialogElement} */ (document.getElementById(dialogId));
    if (!dialog) {
        dialog = /** @type {HTMLDialogElement} */ (mkElt("dialog", { id: dialogId }));
        if (!dialog) { throw Error("Could not create dialog"); }
        document.body.appendChild(dialog);
    }
    dialog.innerHTML = html;
    addXclose(dialog);
    if (!(dialog instanceof HTMLDialogElement)) { throw Error("Not dialog element"); }
    dialog.showModal();
}

/**
 * @param {string} strHtml
 * @param {{css?: string, theme?: object, script? : Function, [key:string]:any }} opts
 * @return {HTMLDialogElement}
 */
function showHtmlAsDialog(strHtml, opts = {}) {
    const allowedOpts = /** @type {const} */ (["css", "script", "theme"]);
    const rest = { ...opts };
    for (const key of allowedOpts) {
        // delete rest[/** @type {keyof typeof rest} */ (key)];
        delete rest[key];
    }
    if (Object.keys(rest).length > 0) {
        const unknownKeys = Object.keys(rest).join(", ");
        throw new Error(
            `Invalid options passed to displayMenu: ${unknownKeys}. ` +
            `Only allowed: ${allowedOpts.join(", ")}`
        );
    }
    const optScript = opts?.script;
    const optCss = opts?.css || "";

    const dialog = mkElt("dialog");
    if (!(dialog instanceof HTMLDialogElement)) { throw Error("Not dialog element"); }

    const strCss = `<style>${optCss}</style>`;
    dialog.innerHTML = `${strCss} ${strHtml}`;
    if (optScript) {
        optScript(dialog);
    }
    addXclose(dialog);
    document.body.appendChild(dialog);
    if (opts.theme) {
        // debugger;
        modBasicUI.applyMaterialTheme(opts.theme.color, opts.theme.dark, dialog);
    }
    dialog.showModal();
    return dialog;
}


/*
// Not used here.
// For <dialog> and popovers:
const clsDontRemoveme = "dont-remove-me";
document.querySelectorAll("dialog").forEach(elt => elt.classList.add(clsDontRemoveme));
document.querySelectorAll("[popover]").forEach(elt => elt.classList.add(clsDontRemoveme));
*/



/////////////////////////
//// Debugging helers
/////////////////////////

function debugIsMobileEmulation() {
    if (!isLocalhost()) return false;
    if (isMobileEmulation()) {
        console.log("Mobile emulation detected!");
        return true;
    }
    return false;
}




// FIX-ME: Move to Basic-UI.js:
function isLocalhost() {
    return Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]' // IPv6 loopback
    );
}
function isMobileEmulation() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // 1. Check if the User-Agent claims to be mobile
    const uaIsMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(ua);

    // 2. Check if the system platform reports a desktop OS
    const platformIsDesktop = /Mac|Win|Linux/i.test(platform);

    // 3. Fallback check for User-Agent Client Hints (modern Chrome/Edge)
    let chIsDesktop = false;
    if (navigator.userAgentData) {
        chIsDesktop = !navigator.userAgentData.mobile;
    }

    // If UA says mobile but OS says desktop, it's emulated
    return uaIsMobile && (platformIsDesktop || chIsDesktop);
}

/*
// I do not think this is needed any more.
// Dev tools set the userAgent.
function OLDisDebugAndroid() {
    if (isLocalhost()) {
        if (isMobileEmulation()) {
            console.log('Running locally, dev tools mobile, pretend Android');
            return true; // FIX-ME:
        }
    }
    return isAndroid();
}
*/

function isAndroid() {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.indexOf("android") > -1;
    return isAndroid;
}


// const btnDebug = mkElt("button", undefined, "Debug");
// const btnDebug = modBasicUI.mkIconButton("info.svg", "Settings");
const btnDebug = mkIconButton("./info.svg", "Settings");
btnDebug.id = "btn-settings";
btnDebug.classList.add("md-xs");

document.body.appendChild(btnDebug);
btnDebug.addEventListener("click", handleDebugClick);
async function handleDebugClick(evt) {
    evt.stopPropagation();
    console.log("handleDebugClick");

    const inpColor = mkElt("input", { type: "text", placeholder: "CSS color" });
    inpColor.value = currentTheme.color;
    inpColor.style.width = "calc(7ch + 30px)";
    const colorPicker = mkElt("input", { type: "color" });
    colorPicker.value = currentTheme.color;
    const eltColor = mkElt("span", undefined, [inpColor, colorPicker]);
    eltColor.style.display = "inline-flex";
    const lblColor = mkElt("label", { class: "label-selection-row" }, [
        "Color", eltColor
    ]);

    inpColor.addEventListener("input", () => {
        const hex = modBasicUI.colorNameToHex(inpColor.value.trim());
        // console.log({ hex });
        colorPicker.value = hex;
        if (hex) {
            currentTheme.color = inpColor.value;
            applyCurrentTheme();
        }
    });
    colorPicker.addEventListener("input", () => {
        inpColor.value = colorPicker.value;
        currentTheme.color = inpColor.value;
        applyCurrentTheme();
    });

    const chkDark = mkElt("input", { type: "checkbox" });
    chkDark.checked = currentTheme.dark;
    chkDark.addEventListener("change", () => {
        currentTheme.dark = chkDark.checked;
        applyCurrentTheme();
    });
    const lblDark = mkElt("label", { class: "label-selection-row" }, [
        chkDark,
        "Dark",
    ]);
    const btnSetColor = mkElt("button", undefined, "Set");
    const btnResetColor = mkElt("button", undefined, "Reset");
    const divButtons = mkElt("div", undefined, [
        btnSetColor,
        btnResetColor
    ]);
    divButtons.style = `
        display: flex;
        gap: 10px;
    `;


    const divColors = mkElt("p", undefined, [
        lblColor,
        lblDark,
        divButtons
    ]);
    divColors.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const btnSnackbar = mkElt("button", undefined, "Snackbar");
    const divSnackbar = mkElt("p", undefined, [
        btnSnackbar,
    ]);
    const bdy = mkElt("div", undefined, [
        mkElt("h2", undefined, "Color Theme"),
        divColors,
        // divSnackbar
    ]);

    btnSetColor.addEventListener("click", evt => {
        evt.stopPropagation();
        saveTheme();
    });
    btnResetColor.addEventListener("click", evt => {
        evt.stopPropagation();
        resetTheme();
        inpColor.value = currentTheme.color;
        colorPicker.value = currentTheme.color;
        applyCurrentTheme();
    });

    // debugger;
    btnSnackbar.addEventListener("click", evt => {
        evt.stopPropagation();
        let str = `
    isAndroid=="${isAndroid()}"
    getSearchParamNames()=="${getSearchParamNames().join(',')}"
    isDisplayModePWA()=="${isDisplayModePWA()}"
    `;
        showSnackbar(str, 20 * 1000);
    });

    // debugger;
    modBasicUI.showDialog(bdy);
}

function getSearchParamNames() {
    // Checking installed: Works, but only when shared to
    const sp = new URLSearchParams(window.location.search);
    const a = [...sp];
    const n = a.map(e => e[0]);
    return n;
}
function isDisplayModePWA() {
    // Checking installed: only this way works today (2026-08-11), from Claude
    // Works on Android, Windows, Linux (but not iOS)
    return ['fullscreen', 'standalone', 'minimal-ui']
        .some(mode => window.matchMedia(`(display-mode: ${mode})`).matches);
}



/**
 * 
 * @param {string|HTMLSpanElement} icon 
 * @param {string} title 
 * @returns {HTMLButtonElement}
 */
function mkIconButton(icon, title) {
    let eltIcon = icon;
    if (typeof icon == "string") {
        const span = mkElt("span", { class: "icon-image" });
        span.style.backgroundImage = `url(${icon})`;
        eltIcon = span;
    }
    const btn = mkElt("button", undefined, eltIcon);
    // btn.classList.add("icon-button");
    btn.classList.add("md-icon-button");
    // btn.style.padding = "4px";
    // btn.style.display = "inline-flex";
    btn.title = title;
    return btn;
}
// background-image
