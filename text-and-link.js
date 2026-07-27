// @ts-check

navigator.serviceWorker.register('./sw.js');

const eltTitle = document.getElementById("header-title");
eltTitle.textContent = "Text+Link";

const divOutput = document.getElementById("output");
const divOutputText = document.getElementById("output-text");
const divOutputLink = document.getElementById("output-link");
const taLink = document.getElementById("ta-link");
if (!taLink) throw Error("!inpLink");
taLink.addEventListener("input", _evt => {
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
    const eltA = mkElt("a", { href }, href);
    divOutputLink?.appendChild(eltA);
    const btnCopy = document.getElementById("btn-copy");
    btnCopy.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const text = divOutputText.textContent;
        const link = divOutputLink.textContent;
        const all = `${text}\n${link}`;
        await navigator.clipboard.writeText(all);
        // Do we need to inform user?
        const ua = navigator.userAgent.toLowerCase();
        const isAndroid = ua.indexOf("android") > -1;
        if (isAndroid) return;
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

    // const eltInfoHeader = document.getElementById("info-header");
    // const eltInfo = document.getElementById("info");
    const eltInfoHeader = document.getElementById("info-header");
    if (!eltInfoHeader) throw Error("!eltInfoHeader");
    // const btnInfo = modMdc.mkMDCiconButton("info", "Show/hide info");
    const btnInfo = document.createElement("button")
    btnInfo.textContent = "Show/hide info";
    btnInfo.style.color = "blue";
    btnInfo.addEventListener("click", evt => { toggleInfo(); });
    eltInfoHeader.appendChild(btnInfo);

    const sharedParams = modShPar.getOurSharedParams();
    console.log({ sharedParams });
    function toggleInfo() {
        eltInfoHeader.classList.toggle("display-none");
    }
    function showInfo() {
        // divOut.textContent = "";
        const p1 = mkElt("p", undefined,
            `This web page can be a share target for apps and web pages.`);
        eltInfo.appendChild(p1);

        const linkPWa = "https://en.wikipedia.org/wiki/Progressive_web_app";
        const aPwa = mkElt("a", { href: linkPWa }, "Progressive web app");
        const p2 = mkElt("p", undefined, [
            `For this to work it must be "installed as a PWA".`,
            "(", aPwa, ")"
        ]);
        eltInfo.appendChild(p2);
    }
    if (!sharedParams) {
        btnInfo.remove();
        // showInfo();
        toggleInfo();
    }
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

const mkElt = window["mkElt"];
/**
 * @param {HTMLElement} eltContent
 * @returns {HTMLDivElement}
 */
function mkExpandable(eltContent) {
    return mkElt("div", { class: "expandable-wrapper" }, [
        mkElt("div", { class: "expandable-content" }, eltContent)
    ]);
}