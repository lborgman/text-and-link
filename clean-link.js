// @ts-check

// @ts-ignore
const mkElt = window["mkElt"];
// @ts-ignore
const errorHandlerAsyncEvent = window["errorHandlerAsyncEvent"];

navigator.serviceWorker.register('./sw.js');

export { };

/**
 * @typedef {Object} BeerHtmlModule
 * @property {Function} createButton
 * @property {Function} createChip
 * @property {Function} createChipGroup
 * @property {Function} createMenu
 * @property {Function} createSelect
 * @property {Function} createSlider
 * @property {Function} createSwitch
 * @property {Function} createTabs
 * @property {Function} createTextField
 * @property {Function} createTextareaField
 */
// @ts-ignore
const modBeerHtml = await import("beer-html");

// const modBasicUI = await import("https://lborgman.github.io/basic-ui/js/basic-ui.js");
// const modBasicUI = await import("basic-ui");
/**
 * @typedef {Object} BasicUiModule
 * @property {Function} addMenuAlt
 * @property {Function} addMenuDivider
 * @property {Function} addXclose
 * @property {Function} closeMyDialog
 * @property {Function} colorNameToHex
 * @property {Function} getRootCssVarMs
 * @property {Function} isCssVariableDefined
 * @property {Function} mkDialogMenu
 * @property {Function} mkXclose
 * @property {Function} nextPaint
 * @property {Function} openDialog
 * @property {Function} showDialog
 * @property {Function} showDialogConfirm
 * @property {Function} showHere
 * @property {Function} snackbar
 * @property {Function} waitForLayoutSilence
 */

// @ts-ignore
const modBasicUI = /** @type {BasicUiModule} */ (await import("basic-ui"));



// const storagePrefix = "clean-link";
// const keyColorTheme = `${storagePrefix}-theme`;

/**
 * @typedef {Object} ColorTheme
 * @property {string} [color] - CSS color
 * @property {boolean} [dark]
 * @property {string} [variant]
 */

function saveTheme() {
    const strJson = JSON.stringify(currentTheme);
    localStorage.setItem(myGlobal.keyColorTheme, strJson);
}


/**
 * @typedef {Object} GlobalUtilities
 * @property {() => any} retrieveTheme
 * @property {string} keyColorTheme
 */
/** @type {GlobalUtilities} */
const myGlobal = /** @type {any} */ (globalThis);

/**
 * @returns {ColorTheme}
 */
function retrieveTheme() {
    // return /** @type {any} */ (globalThis).retrieveTheme();
    return myGlobal.retrieveTheme();
}
function resetTheme() {
    localStorage.removeItem(/** @type {any} */(globalThis).keyColorTheme);
    currentTheme = retrieveTheme();
}


/** @type {ColorTheme} */
let currentTheme;
{
    /** @type {ColorTheme} */
    const storedTheme = retrieveTheme();
    if (storedTheme) {
        applyTheme(storedTheme);
    }
}

/**
 * @param {ColorTheme} theme 
 */
function applyTheme(theme) {
    if (!theme) { console.error("no theme"); debugger; }
    const { color, dark, variant } = theme;
    currentTheme = theme;
    // @ts-ignore
    const themePalette = BasicUI_ColorThemes.generateTheme(color, dark, variant);
    // @ts-ignore
    BasicUI_ColorThemes.applyTheme(themePalette);
    document.documentElement.style.opacity = '1';
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
    // console.log(strOut, advIds);
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
                    // console.log("removed ", id);
                    divCleanedDetails.appendChild(mkElt("div", undefined, `Removed ${id}`));
                });
                const divExpandingCleanedInfo = mkExpandable(divCleanedDetails);
                const eltCleanedInfo = document.getElementById("cleaned-info");
                if (!eltCleanedInfo) throw Error("!eltCleanedInfo");
                if (!eltCleanedInfo.parentElement) throw Error("!eltCleanedInfo.parentElement");

                // eltCleanedInfo.parentElement.insertBefore(divExpandingCleanedInfo, eltCleanedInfo.nextElementSibling);
                eltCleanedInfo.appendChild(divExpandingCleanedInfo);

                // console.log({ eltCleanedInfo, divExpandingCleanedInfo });
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
    // FIX-ME:
    // const isDelayedClick = evt.isDelayedClick;
    const isDelayedClick = !evt.isTrusted;
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
            mkElt("div", { style: "color:green; font-style:italic" }, "Copied:"),
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
            cleanLinkShowSnackbar(message);
            return;
        }
        // On Android there is very good default feedback when copying.
        if (isAndroid()) {
            const bcr = btnCopy.getBoundingClientRect();
            cleanLinkShowHere(bcr.left, bcr.top + bcr.height - 10, "Copied", 1.5);
            return;
        }
        cleanLinkShowSnackbar(message);
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
    // console.log({ url });
    const arrNames = [...url.searchParams].map(p => { return p[0]; });
    arrNames.forEach(n => {
        if (n.startsWith("utm_")) {
            // console.log({ n });
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
    // console.log({ sharedParams });
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
        // addXclose(d);
        // d.showModal();
        // requestAnimationFrame(() => { dialog.classList.add("fade-backdrop"); });
        modBasicUI.openDialog(d);
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
            variant: currentTheme.variant
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
    if (funClose) { throw Error("funClose not supported any more"); }
    return modBasicUI.mkXclose();
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
    cleanLinkShowHere(evt.clientX + 30, evt.clientY - 40, `Can't "${txtA}" this here`, 3);
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
            cleanLinkShowHere(evt.clientX, evt.clientY, "You are already there!", 3);
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
 * Show txt popup-style in the snackbar position of the screen
 * @param {string|HTMLDivElement} txtOrDiv
 * @param {number} secDuration
 */
function cleanLinkShowSnackbar(txtOrDiv, secDuration = 4) {
    return modBasicUI.snackbar(txtOrDiv, secDuration);
    // return showOver(txtOrDiv, 3);
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
function cleanLinkShowHere(clientX, clientY, txtOrDiv, secTimeout) {
    // return showOver(txtOrDiv, secTimeout, clientX, clientY);
    modBasicUI.showHere(clientX, clientY, txtOrDiv, secTimeout);
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
    return modBasicUI.addXclose(dialog);
}


/**
 * @param {HTMLDialogElement} dialog
 */
function OLDcloseDialog(dialog) {
    dialog.close();
    if (!dialog.classList.contains("html-dialog")) {
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
 * @param {{css?: string, theme?: ColorTheme, script? : Function, [key:string]:any }} opts
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
        const { color, dark, variant } = opts.theme;
        const themePalette = BasicUI_ColorThemes.generateTheme(color, dark, variant);
        BasicUI_ColorThemes.applyTheme(themePalette);
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

    /**
     * @typedef {Object} NavigatorUAData
     * @property {boolean} mobile
     * @property {Array<{brand: string, version: string}>} brands
     */
    // Tell VS Code that navigator includes this custom definition
    /** @type {Navigator & { userAgentData?: NavigatorUAData }} */
    const nav = navigator;
    if (nav.userAgentData) {
        chIsDesktop = !nav.userAgentData.mobile;
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


// const btnSettings = mkIconButton("./info.svg", "Settings");
const btnSettings = modBeerHtml.createButton({
    icon: "settings",
    shape: "circle",
    // transparent: true
});
btnSettings.id = "btn-settings";
btnSettings.title = "- Settings";
// btnSettings.classList.add("md-xs");

document.body.appendChild(btnSettings);
btnSettings.addEventListener("click", handleSettingsClick);
/** * @param {MouseEvent} evt - The click event object.  */
async function handleSettingsClick(evt) {
    evt.stopPropagation();
    console.log("handleSettingsClick");

    dialogColorTheme();
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




//////////////////////////////////////////// 4basic

/**
 * Sync user input for an <input type=text> and an <input type=color>
 *
 * @Example
 *  // Note the order here. This function must be called first.
 *  syncInpTextAndColorPicker(inpColor, colorPicker);
 *  inpColor.addEventListener("input", () => { checkCanSaveNewTheme(); });
 *  colorPicker.addEventListener("input", () => { applyNewTheme(); });
 *
 * @param {HTMLInputElement} inpTypeText
 * @param {HTMLInputElement} inpTypeColor
 */
function syncInpTextAndColorPicker(inpTypeText, inpTypeColor) {
    if (inpTypeText.tagName != "INPUT") {
        debugger;
        throw Error("Not <input>");
    }
    if (inpTypeColor.tagName != "INPUT") {
        debugger;
        throw Error("Not <input>");
    }
    if (inpTypeText.type != "text") {
        debugger;
        throw Error("Not <input type=text>");
    }
    if (inpTypeColor.type != "color") {
        debugger;
        throw Error("Not <input type=color>");
    }
    inpTypeText.addEventListener("input", () => {
        const hex = modBasicUI.colorNameToHex(inpTypeText.value.trim());
        // console.log({ hex });
        if (hex) {
            inpTypeText.setCustomValidity("");
            if (document.activeElement == inpTypeText) {
                inpTypeColor.value = hex;
                inpTypeColor.dispatchEvent(new Event('input', { bubbles: true }));
            }
            currentTheme.color = inpTypeText.value;
        } else {
            inpTypeText.setCustomValidity("Invalid color");
        }
        inpTypeText.reportValidity();
        // // Set in a separate input event that runs after this event:
        // checkCanSaveNewTheme();
    });
    inpTypeColor.addEventListener("input", () => {
        if (document.activeElement == inpTypeColor) {
            inpTypeText.value = inpTypeColor.value;
            inpTypeText.dispatchEvent(new Event('input', { bubbles: true }));
        }
        currentTheme.color = inpTypeText.value;
    });
}

function dialogColorTheme() {
    // const inpColor = mkElt("input", { id: "inp-color", type: "text", placeholder: "CSS color" });
    console.log({ modBeerHtml });
    // debugger;
    const { wrapper, input: inpColor } =
        modBeerHtml.createTextField({
            label: "Color",
            border: true
        });
    // debugger;
    inpColor.id = "inp-color";

    inpColor.value = currentTheme.color;
    // fieldColor.style.width = "calc(9ch + 30px)"; // FIX-ME: Why is not 7ch enough??
    // const divFieldColor = mkElt("div", undefined, fieldColor);
    // const divFieldColor = fieldColor;
    wrapper.style.width = "calc(9ch + 30px)"; // FIX-ME: Why is not 7ch enough??
    const colorPicker = mkElt("input", { id: "color-picker", type: "color" });
    colorPicker.value = currentTheme.color;
    const eltColorInputs = mkElt("span", { id: "OLDcolor-inputs" }, [
        wrapper,
        colorPicker
    ]);
    eltColorInputs.classList.add("basic-ui_color-inputs");
    const lblColor = mkElt("label", { class: "label-selection-row" }, [
        mkElt("span", { style: "font-weight:bold; font-size:1.15rem;" }, "Seed Color:"),
        eltColorInputs
    ]);

    function applyDialogTheme() {
        /** @type {ColorTheme} */
        const dlgTheme = {
            color: inpColor.value,
            dark: chkDark.checked,
            variant: divVariants.querySelector(`input:checked`).value
        }
        applyTheme(dlgTheme);
    }


    syncInpTextAndColorPicker(inpColor, colorPicker);
    inpColor.addEventListener("input", () => { checkCanSaveNewTheme(true); });
    colorPicker.addEventListener("input", () => { applyDialogTheme(); });


    const chkDark = mkElt("input", { type: "checkbox" });
    chkDark.addEventListener("change", () => {
        currentTheme.dark = chkDark.checked;
        applyDialogTheme();
    });
    const lblDark = mkElt("label", { class: "label-selection-row" }, [
        chkDark,
        "Dark",
    ]);
    // const btnSaveColorTheme = mkElt("button", undefined, "Save");
    // const btnSaveColorTheme = mkButtonBeer("Save");
    const btnSaveColorTheme = modBeerHtml.createButton({ label: "Save" });

    // const btnResetColorTheme = mkElt("button", undefined, "Reset");
    // const btnResetColorTheme = mkButtonBeer("Reset");
    const btnResetColorTheme = modBeerHtml.createButton({ label: "Reset" });

    const divButtons = mkElt("div", undefined, [
        btnSaveColorTheme,
        btnResetColorTheme
    ]);
    divButtons.style = `
        display: flex;
        gap: 10px;
    `;

    const divVariants = mkElt("div");
    divVariants.style = `
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 10px;
    `;

    divVariants.addEventListener("change", /** @param {Event} evt */(evt) => {
        const target = /** @type {HTMLElement} */ (evt.target);
        if (!(target instanceof HTMLInputElement)) return;
        currentTheme.variant = target.value;
        applyDialogTheme();
    });
    const mkRad = (nam) => {
        const rad = mkElt("input", { type: "radio", value: nam, name: "variant" });
        const lbl = mkElt("label", undefined, [rad, nam]);
        // const currentVariant = currentTheme.variant || "tonalSpot";
        // rad.checked = nam == currentVariant;
        return lbl
    }
    const variants = [
        'tonalSpot',
        'vibrant', 'expressive', 'fidelity', 'content', 'fruitSalad', 'rainbow',
        'monochrome'
    ];
    variants.forEach(v => {
        divVariants.appendChild(mkRad(v));
    });

    const divBgClasses = mkElt("div");
    divBgClasses.style.display = "flex";
    divBgClasses.style.flexWrap = "wrap";
    divBgClasses.style.gap = "8px";
    divBgClasses.style.padding = "8px";
    divBgClasses.style.border = "1px solid gray";
    divBgClasses.style.borderRadius = "4px";


    getCSS_bg_classes().forEach(cls => {
        // const eltCls = mkElt("div", { class: cls }, cls.slice(3));
        const eltCls = mkElt("div", { class: cls.slice(3) }, cls.slice(3));
        eltCls.style.padding = "4px";
        eltCls.style.padding = "3px";
        eltCls.style.outline = "1px solid gray";
        divBgClasses.appendChild(eltCls);
    });
    const divColors = mkElt("p", undefined, [
        lblColor,
        lblDark,
        divVariants,
        divButtons,
        divBgClasses
    ]);
    divColors.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const bdy = mkElt("div", undefined, [
        mkElt("h2", undefined, "Color Theme"),
        divColors,
        // divSnackbar
    ]);

    btnSaveColorTheme.addEventListener("click", /** @param {Event} evt */(evt) => {
        evt.stopPropagation();
        saveTheme();
        btnSaveColorTheme.disabled = true;
    });
    btnResetColorTheme.addEventListener("click", /** @param {Event} evt */ evt => {
        evt.stopPropagation();
        resetTheme();
        fillInTheme(currentTheme);
        applyDialogTheme(); // FIX-ME: ?
    });
    function fillInTheme(theme) {
        const { color, dark, variant } = theme;
        inpColor.value = color;
        colorPicker.value = modBasicUI.colorNameToHex(color);
        chkDark.checked = dark;
        divVariants.querySelector(`input[value=${variant}]`).checked = true
    }

    {
        // For debugging:
        const btnSnackbar = mkElt("button", undefined, "Snackbar");
        btnSnackbar.addEventListener("click", /** @param {Event} evt */ evt => {
            evt.stopPropagation();
            let str = `
                isAndroid=="${isAndroid()}"
                getSearchParamNames()=="${getSearchParamNames().join(',')}"
                isDisplayModePWA()=="${isDisplayModePWA()}"
                `;
            cleanLinkShowSnackbar(str, 20);
        });
    }

    fillInTheme(currentTheme);
    const jsonOldTheme = JSON.stringify(currentTheme);

    /**
     * 
     * @param {boolean} canSurelySave 
     */
    function checkCanSaveNewTheme(canSurelySave) {
        const hasNewTheme = jsonOldTheme != JSON.stringify(currentTheme);
        const somethingToSave = canSurelySave || inpColor.validity.valid && hasNewTheme;
        btnSaveColorTheme.disabled = !somethingToSave;
    }
    bdy.addEventListener("change", /** @param {Event} evt */ evt => {
        checkCanSaveNewTheme(true);
    });
    checkCanSaveNewTheme(false);

    // modBasicUI.showDialog(bdy);

    const dlg = mkElt("dialog", { class: "xbottom" }, bdy);
    // const dlg = mkElt("dialog", { class: "bottom" }, bdy);
    // const dlg = mkElt("dialog", {class:"top"}, bdy);
    // const dlg = mkElt("dialog", {class:"left"}, bdy);
    // const dlg = mkElt("dialog", {class:"right"}, bdy);

    addXclose(dlg);
    dlg.id = "color-theme-dialog";
            // eltColorInputs
    const dlgInnerStyle = `
        NOoutline: 8px dotted red;
        .basic-ui_color-inputs {
            NOoutline: 1px dotted red;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            > * {
                position: static;
                NOoutline: 1px dashed yellow;
            }
            #color-picker {
                height: 40px;
                width: 40px;
                opacity: 1;
            }
        }


        /* 1. Target Webkit browsers (Chrome, Safari, Edge, Opera) */
input[type=color]::-webkit-color-swatch-wrapper {
    padding: 0;
}
input[type=color]::-webkit-color-swatch {
    border: none;
}

/* 2. Target Firefox */
input[type=color]::-moz-color-swatch {
    border: none;
}

    `;
    addDialogStyle(dlg, dlgInnerStyle);
    function addDialogStyle(dlg, innerStyle) {
        const idDialog = dlg.id;
        if (("string" !== typeof idDialog) || idDialog.trim().length == 0) {
            debugger;
            throw Error("dlg.id is missing");
        }
        const eltStyle = mkElt("style");
        eltStyle.textContent = `
        #${idDialog} {
            ${innerStyle}
        }
    `;
        dlg.prepend(eltStyle);
    }

    document.body.appendChild(dlg);
    // dlg.style.opacity = "1";
    // dlg.style.visibility = "visible";
    // dlg.showModal();
    modBasicUI.openDialog(dlg);
}

getCSS_bg_classes();
function getCSS_bg_classes() {
    return [
        "bg-background",
        "bg-surface",
        "bg-surface-variant",
        "bg-primary",
        "bg-primary-container",
        "bg-secondary",
        "bg-secondary-container",
        "bg-tertiary",
        "bg-tertiary-container",
        "bg-error",
        "bg-error-container",
    ];
    /*
    */
    const allDefinedClasses = new Set();

    // Loop through all loaded stylesheets on the page
    Array.from(document.styleSheets).forEach(sheet => {
        try {
            // Loop through each CSS rule within the stylesheet
            Array.from(sheet.cssRules || sheet.rules).forEach(rule => {
                // Check if the rule is a standard style rule and has a selector
                if (rule.selectorText) {
                    // Find everything matching a .class pattern using regex
                    const classes = rule.selectorText.match(/\.[a-zA-Z0-9_-]+/g);
                    if (classes) {
                        classes.forEach(c => allDefinedClasses.add(c.replace('.', '')));
                    }
                }
            });
        } catch (e) {
            // Cross-origin stylesheets will throw a security error unless CORS is configured
            console.log("Could not read stylesheet rules due to security restrictions:", sheet.href);
        }
    });

    const arr = [...allDefinedClasses];
    const arr2 = arr.filter(a => { return a.startsWith("bg-"); })
    // console.log(arr2);
    // console.log(arr2.join(", "));
    const arr3 = arr2.map(cls => `"${cls}"`);
    console.log(arr3.sort().join(",\n"));
    return arr2;
}