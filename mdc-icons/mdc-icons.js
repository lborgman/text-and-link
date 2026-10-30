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

debugger;
const myDir = new URL('./', import.meta.url).href;

// FIX-ME: What format do I need here:
// const urlWoff2File = "./mdc-icons/icons/my-symbols.woff2";
const urlWoff2File = `${myDir}woff2/my-symbols.woff2`;

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
        checkWoff2icons("dialog");
    });
}


let iconsForApp = "";

/**
 * @param {string} whichApp 
 */
export function setMdcIconsFor(whichApp) {
    iconsForApp = whichApp;
    saveStoredIconsUsed();
}


const keyMdcIcons = () => {
    if (0 == iconsForApp.length) {
        const msg = "iconsForApp is not set";
        console.error(msg);
        debugger;
        throw Error(msg);
    }
    return `used-mdc-symbols-${iconsForApp}`;
}

function getStoredIconsUsed() {
    const keyIconsUsed = keyMdcIcons();
    const storedIconsUsed = localStorage.getItem(keyIconsUsed);
    if (storedIconsUsed != null) {
        const arrUsed = storedIconsUsed.split(",");
        arrUsed.forEach(sym => {
            if (sym.length == 0) throw Error("sym is empty string");
            setMdcIconsUsed.add(sym);
        });
    }
}
function saveStoredIconsUsed() {
    if (location.hostname != "localhost") return;
    if (!iconsForApp) return;
    getStoredIconsUsed();
    if (setMdcIconsUsed.size == 0) return;
    localStorage.setItem(keyMdcIcons(), [...setMdcIconsUsed].sort().join(","));
}


async function mkWOFF2downloadLink() {
    const ourIcons = getOurMdcIconsList();
    const linkWOFF2css = `https://fonts.googleapis.com/css2?family=Material+Symbols+${mdcIconStyle}:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${ourIcons}`;
    console.log(linkWOFF2css.slice(8));
    let cssResponse;
    // https://web.dev/articles/fetch-api-error-handling
    try {
        cssResponse = await fetch(linkWOFF2css);
    } catch (err) {
        console.error(linkWOFF2css, err);
        debugger;
        throw (err);
    }
    const txtCss = await cssResponse.text();
    const m = txtCss.match(/url\((.*?)\)/m);
    if (m == null) {
        const msg = "Did not find url()";
        console.error(msg);
        debugger;
        throw Error(msg);
    }
    const linkWOFF2 = m[1];
    return linkWOFF2;
}
