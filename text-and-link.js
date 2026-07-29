// @ts-check

// @ts-ignore
const mkElt = window["mkElt"];

navigator.serviceWorker.register('./sw.js');

const eltTitle = document.getElementById("header-title");
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
    // debugger;
    const strIn = taLink.value.trim();
    // if (strIn.length == 0) { divOutputLink.textContent = ""; return; }
    if (!strIn.startsWith("https://")
        &&
        !strIn.startsWith("http://")
    ) {
        debugger;
        divOutputLink.textContent = "";
        return;
    }

    /** @type {string[]} */
    const advIds = [];
    const strOut1 = removeTrailIds(strIn, advIds);
    const strOut = removeByPattern(strOut1, advIds);
    console.log(strOut, advIds);
    const numCleaned = advIds.length;
    const eltCleanedInfo = document.getElementById("cleaned-info");
    if (!eltCleanedInfo) throw Error("!eltCleanedInfo");
    if (numCleaned == 0) {
        eltCleanedInfo.textContent = `Found no click identifiers`;
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
    const btnCopy = document.getElementById("btn-copy");
    btnCopy.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const text = divOutputText.textContent;
        const link = divOutputLink.textContent;
        const all = `${text}\n${link}`;
        await navigator.clipboard.writeText(all);
        // modMdc.mkMDCsnackbar("copied to clipboard");
    }));

}

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
    let url = new URL(strUrl);
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
        debugger;
        return err.message;
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
    const modShPar = await import("./sharing-params.js");

    const eltLogo = document.getElementById("logo");
    if (!eltLogo) throw Error("!eltLogo");
    eltLogo.addEventListener("click", evt => {
        evt.stopPropagation();
        showHelp();
        return;
        // The code below is not good UI on Android today.
        console.log({ evt });
        const clientX = evt.clientX;
        const clientY = evt.clientY;
        const div = showHere(clientX, clientY, "Opening in new window...", "tell-open-link");

        const secDelay = 3;
        const secDuration = secDelay + 2;
        div.style.transitionDuration = `${secDuration}s`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                div.style.opacity = "0"; // Transition will now trigger smoothly
            });
        });
        // return;

        const aInfo = mkElt("a", {
            href: "https://lborgman.github.io/text-and-link/",
            target: "_blank"
        });
        setTimeout(() => {
            div.remove();
            aInfo.click();
        }, secDelay * 1000);

    })

    const sharedParams = modShPar.getOurSharedParams();
    console.log({ sharedParams });
    if (sharedParams) {
        const divText = mkElt("div", { id: "text-content" });
        if (sharedParams.title) {
            const div = mkElt("div", undefined, sharedParams.title + "\n");
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


            // const eltA = mkElt("a", { href }, href)
            // const div = mkElt("div", undefined, eltA);
            // divText.appendChild(div);
        }
        // const divTextOut = mkElt("div", { id: "div-output", class: "mdc-card" }, [divText, btnCopy]);
        // divOutput.appendChild(divTextOut);
    }
    const isInstalled = await isPWAInstalled();
    switch (isInstalled) {
        case true:
            document.documentElement.classList.add("pwa-is-installed");
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
    // document.documentElement.classList.add("is-android");
    const d = document.getElementById("can-be-installed");
    if (!(d instanceof HTMLDialogElement)) throw Error("Not dialog");
    addXclose(d);
    d.showModal();
}

async function isPWAInstalled() {
    // FIX-ME: experimental
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps
    // https://caniuse.com/mdn-api_navigator_getinstalledrelatedapps
    if ('getInstalledRelatedApps' in navigator) {
        const relatedApps = await navigator.getInstalledRelatedApps();
        // Filter to see if your webapp platform is in the list
        const isInstalled = relatedApps.some(app => app.platform === 'webapp');

        if (isInstalled) {
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
 * Show txt popup-style.
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
    const div = mkElt("div", { class: "show-here"  }, txtOrDiv);
    div.setAttribute("popover", "");
    if (idHtml != undefined) { div.id = idHtml; }
    div.style.left = `${clientX}px`;
    div.style.top = `${clientY}px`;
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
    return div;
}

function showHelp() {
    const urlHelp = "https://lborgman.github.io/text-and-link/";
    showUrlAsDialog(urlHelp);
}
/**
 * @param {string} url 
 */
async function showUrlAsDialog(url) {
    const html = await fetch(url).then(r => r.text());
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
function showHtmlAsDialog(strHtml, optDelegate) {
    const dialog = mkElt("dialog");
    if (!(dialog instanceof HTMLDialogElement)) { throw Error("Not dialog element"); }
    // dialog.innerHTML = strHtmlSpans = replaceAnchorsWithSpans(strHtml);
    dialog.innerHTML = strHtml;
    if (optDelegate) {
        dialog.addEventListener(optDelegate.eventName, evt => optDelegate.funHandle(evt));
    }
    addXclose(dialog);
    document.body.appendChild(dialog)
    dialog.showModal();
}
async function showWikipediaAsDialog(pageTitle) {
    const html = await fetchWikiArticle(pageTitle, lang = 'en');
    function handleClick(evt) {
        let targetA = evt.target;
        if (targetA.tagName != "A") {
            // debugger;
            const newA = targetA.closest("a");
            if (!newA) { return; }
            targetA = newA;
        }
        const href = targetA.getAttribute("href");
        console.log({ target: targetA, href });
        if (href.startsWith("#")) { return; }
        evt.stopPropagation();
        evt.preventDefault();
        const mWiki = href.match(new RegExp("^/wiki/(.*)$"));
        if (mWiki) {
            const wikiTitle = mWiki[1];
            showWikipediaAsDialog(wikiTitle);
            return;
        }
        const div = showHere(evt.clientX, evt.clientY, "Can't show this here");
        setTimeout(() => div.remove(), 2000);
    }
    showHtmlAsDialog(html, {
        eventName: "click",
        funHandle: handleClick
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
        // debugger;
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
    // evt.stopPropagation();
    // evt.preventDefault();
    // debugger;
    // NOTE: first child element must covers the whole <dialog>
    const dialog = evt.target;
    // if (dialog?.tagName == "DIALOG") {
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


function isAndroid() {
    return true; // FIX-ME:
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

function replaceAnchorsWithSpans(htmlString) {
    // if (!htmlString || typeof htmlString !== 'string') { return htmlString; }

    try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        const anchors = tempDiv.querySelectorAll('a');

        anchors.forEach(anchor => {
            // const href = anchor.href;
            const href = anchor.getAttribute("href");
            if (href == null) { return; }
            // const u = new URL(href);
            // debugger;
            // if (href.startsWith(location.href)) { // debugger; return; }
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