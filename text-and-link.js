// @ts-check

// @ts-ignore
const mkElt = window["mkElt"];

navigator.serviceWorker.register('./sw.js');

// const eltTitle = document.getElementById("header-title");
// eltTitle.textContent = "Text+Link";

const divOutput = document.getElementById("output");
const divOutputText = document.getElementById("output-text");
const divOutputLink = document.getElementById("output-link");
const taLink = document.getElementById("ta-link");
if (!taLink) throw Error("!inpLink");
taLink.addEventListener("input", _evt => {
    handleInputLink();
});
taLink.addEventListener("change", _evt => {
    handleInputLink();
});
function handleInputLink() {
    const strIn = taLink.value.trim();
    if (!canBeWebUrl(strIn)) {
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
        btnCleanedInfo.addEventListener("click", evt => {
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
            eltCleanedInfo.parentElement.insertBefore(divExpandingCleanedInfo, eltCleanedInfo.nextElementSibling);
            console.log({ eltCleanedInfo, divExpandingCleanedInfo });
            setTimeout(() => { divExpandingCleanedInfo.classList.add("expanded") }, 10);
        });
    }



    divOutputLink.textContent = "";
    const href = strOut;
    const eltA = mkElt("a", { href, style: "word-wrap:anywhere;" }, href);
    divOutputLink.appendChild(eltA);

}
const btnCopy = document.getElementById("btn-copy");
btnCopy.addEventListener("click", errorHandlerAsyncEvent(async evt => {
    const text = divOutputText.textContent;
    const link = divOutputLink.textContent;
    if (text.length + link.length == 0) {
        showSnack("Nothing to copy");
        return;
    }
    const allText = `${text}\n${link}`;
    console.log({ text, link, allText });
    try {
        await navigator.clipboard.writeText(allText);
        const elt = mkElt("div", { style: "max-width: clamp(160px, 400px, 70dvw);" }, [
            mkElt("i", { style: "color:blue;" }, "Copied:"),
            mkElt("pre", { style: " overflow-wrap: anywhere; white-space: pre-wrap; " }, allText)
        ]
        );
        showSnack(elt);
    } catch (err) {
        debugger;
        throw Error(err);
    }
    // modMdc.mkMDCsnackbar("copied to clipboard");
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
function removeByPattern(strUrl, advIds) {
    let url;
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
    let url;
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
            advIds.push(clickId);
        }
    });
    return url.href;
}


(async () => {
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
})();

if (isAndroid()) {
    document.documentElement.classList.add("is-android");
    // We have checked before if it is in the DOM!
    const d = document.getElementById("can-be-installed");
    if (d) {
        addXclose(d);
        d.showModal();
    }
}

// FIX-ME: experimental
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps
// https://caniuse.com/mdn-api_navigator_getinstalledrelatedapps
async function isPWAInstalled() {
    // debugger;
    // Check for param from manifest:
    if (new URLSearchParams(window.location.search).get('utm_source') === 'pwa') {
        showSnack("Found utm_source");
        return true;
    }
    showSnack("No utm_source");
    if (new URLSearchParams(window.location.search).has('url')) {
        return true;
    }
    if ('getInstalledRelatedApps' in navigator) {
        const relatedApps = await navigator.getInstalledRelatedApps();
        // Filter to see if your webapp platform is in the list
        const isInstalled = relatedApps.some(app => app.platform === 'webapp');
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

/**
 * @param {HTMLElement} eltContent
 * @returns {HTMLDivElement}
 */
function mkExpandable(eltContent) {
    return mkElt("div", { class: "expandable-wrapper" }, [
        mkElt("div", { class: "expandable-content" }, eltContent)
    ]);
}

/**
 * Show txt popup-style in the middle of the screen
 */
function showSnack(txtOrDiv) {
    const div = mkElt("div", { class: "snack" }, txtOrDiv);
    div.setAttribute("popover", "");
    document.documentElement.appendChild(div);
    div.showPopover();
    // return; // FIX-ME:
    setTimeout(() => {
        div.remove();
    }, 3 * 1000);
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
 * @param {string} [idHtml] - override CSS values in "show-here"
 * @returns {HTMLDivElement}
 */
function showHere(clientX, clientY, txtOrDiv, idHtml) {
    clientX = Math.max(0, clientX);
    clientY = Math.max(0, clientY);
    const div = mkElt("div", { class: "show-here" }, txtOrDiv);
    div.setAttribute("popover", "");
    if (idHtml != undefined) { div.id = idHtml; }
    document.documentElement.appendChild(div);
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
    div.showPopover();
    div.style.margin = `0`;
    div.style.position = `fixed`;
    div.style.left = `${clientX}px`;
    div.style.top = `${clientY}px`;

    return div;
}

async function showHelp() {
    const urlHelp = "https://lborgman.github.io/text-and-link/";
    const html = await fetch(urlHelp).then(r => r.text());
    // const htmlGH = html.replaceAll('"/', '"https://lborgman.github.io/');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    removeHtmlHeaderElements(tempDiv);
    function removeHtmlHeaderElements(tempDiv) {
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

    // const dlg = showHtmlAsDialog(fullDiv.innerHTML);
    const dlg = showHtmlAsDialog(tempDiv.innerHTML, {
        css: ourCss,
        // FIX-ME: why does the linter complain??
        // script: scriptAddtWikipediaClickFun
        script: scriptAddShowHelpClickFun,
    });

    dlg.id = "show-help-dialog";
    // dlg.style.backgroundColor = "#252525";
    // dlg.style.color = "#e8e8e8";
    // dlg.querySelectorAll("a").forEach(a => a.style.color = "#ffcc00");
}
/**
 * @param {string} url 
 */
async function showUrlAsDialog(url) {
    const html = await fetch(url).then(r => r.text());
    console.log({ html });
    // document.getElementById("helpContent").innerHTML = html;
    const dialogId = "helpContent";
    let dialog = document.getElementById(dialogId);
    if (!dialog) {
        dialog = mkElt("dialog", { id: dialogId });
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
 * @param {{css?: string, script?: string, [key: string]: any}} opts
 * @return {HTMLDialogElement}
 */
function showHtmlAsDialog(strHtml, opts = {}) {
    const allowedOpts = ["css", "script"]
    const rest = { ...opts };
    for (const key of allowedOpts) { delete rest[key]; }
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
    document.body.appendChild(dialog)
    dialog.showModal();
    return dialog;
}
async function showWikipediaAsDialog(pageTitle) {
    const html = await fetchWikiArticle(pageTitle, lang = 'en');
    showHtmlAsDialog(html, {
        script: scriptAddtWikipediaClickFun,
        css: "dialog[open] { padding-top:40px; }"
    });
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



///////////////////////////
///// Dialogs

/**
 * @param {function} [funClose]
 * @returns {HTMLButtonElement}
 */
function mkXclose(funClose) {
    const xClose = mkElt("button", { class: "x-close", title: "- Close" }, "✖");
    xClose.addEventListener("click", evt => {
        evt.stopPropagation();
        if (funClose) {
            funClose();
            return;
        }
        (xClose.closest("dialog"))?.close();
    });
    return xClose;
}
function addXclose(dialog) {
    const btnClose = dialog.querySelector("button[class=x-close]");
    if (btnClose) { return; }
    const elt = mkXclose(() => closeDialog(dialog));
    // dialog.appendChild(elt);
    dialog.insertBefore(elt, dialog.firstElementChild);
    return elt;
}

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
/*
w
*/

/**
 * 
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


function isAndroid() {
    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]' // IPv6 loopback
    );

    if (isLocalhost) {
        console.log('Running locally, pretend Android');
        return true; // FIX-ME:
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.indexOf("android") > -1;
    return isAndroid;
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


function getAHref(evt) {
    let targetA = evt.target;
    if (targetA.tagName != "A") {
        const newA = targetA.closest("a");
        if (!newA) { return; }
        targetA = newA;
    }
    const href = targetA.getAttribute("href");
    console.log({ targetA, href });
    return href;
}
function handleWikipediaClick(evt) {
    /*
    let targetA = evt.target;
    if (targetA.tagName != "A") {
        const newA = targetA.closest("a");
        if (!newA) { return; }
        targetA = newA;
    }
    const href = targetA.getAttribute("href");
    */
    const href = getAHref(evt);
    if (!href) { return; }
    if (href.startsWith("#")) { return; }
    evt.stopPropagation();
    evt.preventDefault();
    // const mWiki = href.match(new RegExp("^/wiki/(.*)$"));
    const mWiki = href.match(new RegExp("^(?:https://en.wikipedia.org)?/wiki/(.*)$"));
    if (mWiki) {
        const wikiTitle = mWiki[1];
        showWikipediaAsDialog(wikiTitle);
        return;
    }
    const div = showHere(evt.clientX + 30, evt.clientY - 40, "Can't show this here");
    setTimeout(() => div.remove(), 3000);
}

/** @param {HTMLDialogElement} dialog */
function scriptAddtWikipediaClickFun(dialog) {
    dialog.addEventListener("click", evt => handleWikipediaClick(evt));
}

/** @param {HTMLDialogElement} dialog */
function scriptAddShowHelpClickFun(dialog) {
    const handleOnThisUrl = (evt) => {
        const baseUrl = location.origin + location.pathname;
        const hrefEvt = getAHref(evt);
        debugger;
        if (baseUrl == hrefEvt) {
            evt.preventDefault();
            evt.stopPropagation();
            const div = showHere(evt.clientX, evt.clientY, "You are already there!");
            setTimeout(() => div.remove(), 3000);
            return true;
        }
        return false;
    }
    dialog.addEventListener("click", evt => {
        if (handleOnThisUrl(evt)) { return; }
        handleWikipediaClick(evt);
    });
}

function removeDialogCanInstall() {
    const dlg = document.getElementById("can-be-installed");
    if (!dlg) { throw Error('Did not find "can-be-installed"'); }
    dlg.remove();
}



// Remove popover on rim click
document.addEventListener('toggle', (event) => {
    if (!event.target) { return; }
    // 1. Ensure the event comes from a closed state
    // 2. Ensure the element actually has the popover attribute
    if (event.newState === 'closed' && event.target.hasAttribute('popover')) {
        event.target.remove(); // Removes the specific popover that closed
    }
}, true); // Using capture phase handles all edge cases smoothly