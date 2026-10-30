// @ts-check

const isLocalHost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' // IPv6 loopback
);

if (!isLocalHost) {
    const msg = "This file should only be loaded in localhost";
    console.error(msg);
    debugger;
    throw Error(msg);
}
showBtnMdcIcons();

const setMdcIconsUsed = new Set();
setMdcIconsUsed.add("edit_off");

/**
 * @param {string} iconName
 */
export function addToUsedIcons(iconName) {
    setMdcIconsUsed.add(iconName);
}

function getOurMdcIconsList() {
    if (setMdcIconsUsed.has("")) debugger;
    return [...setMdcIconsUsed].sort().join(",");
}

/**
 * @param {string} action
 */
async function checkWoff2icons(action) {
    if (!["justCheck", "dialog"].includes(action)) throw Error(`Unknown action parameter: "${action}"`);
    const woffIconsList = await getMdcSymbolsInWoff2File(urlWoff2File);
    const hasWoffIcons = woffIconsList != undefined;

    // const setIconsWoff2 = new Set(hasWoffIcons ? woffIconsList.split(",") : undefined);
    const setMdcIconsWoff2 = setIconsInWoffFile;
    setMdcIconsWoff2.add("edit"); // FIX-ME: mapping codepoints problem
    setMdcIconsWoff2.add("favorite"); // FIX-ME: mapping codepoints problem

    const setIconsMissing = new Set();
    setMdcIconsUsed.forEach(sym => {
        if (!setMdcIconsWoff2.has(sym)) { setIconsMissing.add(sym); }
    });

    // FIX-ME: codepoint problems:
    // setIconsMissing.delete("add");
    setIconsMissing.delete("bookmark");
    // setIconsMissing.delete("delete_forever");
    setIconsMissing.delete("help");
    setIconsMissing.delete("history");
    // setIconsMissing.delete("smart_toy");

    if (action == "justCheck") return setIconsMissing.size;

    const linkWOFF2 = await mkWOFF2downloadLink();
    const missing = [...setIconsMissing].sort().join(", ");
    const used = [...setMdcIconsUsed].sort().join(", ");
    const woff2 = [...setMdcIconsWoff2].sort().join(", ");
    window.console.log(`Missing in woff file: "${missing}",\nsee console for .woff download link`);

    // alert(`Missing in woff file: "${missing}",\nsee console for .woff download link`);
    const makeGroupLabel = (txt) => {
        const elt = mkElt("span", undefined, txt);
        elt.style.fontWeight = "bold";
        elt.style.fontSize = "1.3rem";
        return elt;
    }
    const eltDownload = mkElt("div", { class: "mdc-card" }, [
        mkElt("a", { href: linkWOFF2 }, "Download new WOFF2"),
        mkElt("p", undefined, [
            `Replace the file `,
            mkElt("div", undefined, "./ext/mdc-fonts/my-symbols.woff2"),
            ` with the new file.`
        ])
    ]);
    eltDownload.style = `
        padding: 10px;
        margin-top: 20px;
        background-color: yellowgreen;
    `;
    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Missing Material Symbols"),
        mkElt("div", undefined, [makeGroupLabel(`Used (${setMdcIconsUsed.size}): `), `${used}`]),
        mkElt("div", undefined, [makeGroupLabel(`WOFF2 (${setMdcIconsWoff2.size}): `), `${woff2}`]),
        mkElt("div", undefined, [makeGroupLabel(`Missing (${setIconsMissing.size}): `), `${missing}`]),
        eltDownload,
    ]);
    // mkMDCdialogAlert(body, "Close");
    showDialog(body);
}

/**
 * @param {string} woffUrl 
 * @returns {Promise<string|undefined>}
 */
async function getMdcSymbolsInWoff2File(woffUrl) {
    const modWoffCodepoints = await importFc4i("woff-codepoints");
    const codepoints = await modWoffCodepoints.getCodepoints(woffUrl);
    if (!codepoints) return;


    const modWoff2MdcSymbols = await importFc4i("woff2-mdc-symbols");
    const codepointToName = await modWoff2MdcSymbols.fetchGoogleSymbolNameMap(mdcIconStyle);
    if (!codepointToName) return;

    // Now you can look up names:
    /** @type {string[]} */
    const names = codepoints.map(cp => codepointToName[cp]);
    const cleanedNames = names.filter(name => { if (typeof name == "string") return name; });
    const strNames = cleanedNames.sort().join(",");
    return strNames;

}

function showBtnMdcIcons() {
    const idBtnSym = "button-mdc-symbols";
    const btnSymbols = mkElt("button", { id: idBtnSym }, "Get Woff2");
    btnSymbols.style = `
        background-color: red;
        padding: 15px;
        border-radius: 5px;
        NOz-index: 9999;
    `;
    btnSymbols.setAttribute("popover", "");
    document.body.appendChild(btnSymbols);
    btnSymbols.showPopover();
    btnSymbols.style.inset = "auto";
    btnSymbols.style.margin = "0";
    btnSymbols.style.bottom = "15px";
    btnSymbols.style.right = "15px";
    btnSymbols.addEventListener("click", evt => {
        evt.stopPropagation();
        modMdcIcons.checkWoff2icons("dialog");
    });
}
