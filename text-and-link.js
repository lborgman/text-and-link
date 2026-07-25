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
    debugger;
    const strOut2 = removeByPattern(strIn);
    const strOut = removeTrailIds(strIn);
    console.log(strOut);
    divOutputLink.textContent = strOut;

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
function removeByPattern(strUrl) {
        const url = new URL(strUrl);
        console.log({url});
        debugger;
}
/**
 * @param {string} strUrl
 * @returns {string}
 */
function removeTrailIds(strUrl) {
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
        url = removeUrlParam(url, clickId);
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
            // let url = new URL(sharedParams.url);
            // const href = removeTrailIds(sharedParams.url);
            taLink.value = sharedParams.url;
            handleInputLink();


            const eltA = mkElt("a", { href }, href)
            const div = mkElt("div", undefined, eltA);
            divText.appendChild(div);
        }
        const btnCopy = modMdc.mkMDCbutton("Copy", "raised");
        btnCopy.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const text = divText.textContent;
            await navigator.clipboard.writeText(text);
            // Do we need to inform user?
            const ua = navigator.userAgent.toLowerCase();
            const isAndroid = ua.indexOf("android") > -1;
            if (isAndroid) return;
            modMdc.mkMDCsnackbar("copied to clipboard");
        }));
        const divTextOut = mkElt("div", { id: "div-output", class: "mdc-card" }, [divText, btnCopy]);
        divOutput.appendChild(divTextOut);
    }
})();
