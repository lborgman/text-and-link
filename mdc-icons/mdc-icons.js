// @ts-check

// ts-ignore
// const mkElt = window["mkElt"];

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

const mdcIconStyles = /** @type {const} */ (["Outlined", "Rounded", "Sharp"]);
/** @typedef {(typeof mdcIconStyles)[number]} IconStyle */
/** @type {IconStyle} */ let mdcIconStyle = "Outlined";
/** @param {string} iconStyle */
const isIconSTyle = (iconStyle) => mdcIconStyles.indexOf(iconStyle) != -1;

let mdcIconsClass = "";

const idBtnWoff2 = "button-woff2-symbols";
const btnWoff2 = mkElt("button", { id: idBtnWoff2 }, "Woff2: download file!");

showBtnMdcIcons();

/**
 * @param {number} msTimeOut
 * @returns {Promise<boolean>}
 */
async function onPublicInternet(msTimeOut = 3000) {
    if (!navigator.onLine) { return false; }
    const controller = new AbortController();
    const tmr = setTimeout(() => controller.abort(), msTimeOut);
    try {
        await fetch(`https://google.com/nocache=${Date.now()}`, {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store",
            signal: controller.signal
        });
        return true;
    } catch {
        return false;
    } finally {
        clearTimeout(tmr);
    }
}


const setMdcIconsUsed = new Set();
// setMdcIconsUsed.add("edit_off"); // FIX-ME: Do I still need this?
// addToUsed("edit_off"); // FIX-ME: Do I still need this?
/**
 * @param {string} iconName 
 * @throws {Error}
 */
export async function addToUsedIcons(iconName) {
    const hasIt = await checkIcon(iconName);
    if (!hasIt) { throw Error(`There is no icon named "${iconName}"`) }
    setMdcIconsUsed.add(iconName);
}

const setIconsInMyWoff2File = new Set();


const mdcIconRegex = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

/**
 * @param {IconStyle} iconStyle
 * @param {string[]} [mustHaveIcons]
 * @throws {Error}
 */
export async function initMdcIcons(iconStyle, mustHaveIcons = []) {
    const isIconNameArray = (/** @type {any} */ val) =>
        Array.isArray(val) && val.every((item) =>
            typeof item === 'string' && mdcIconRegex.test(item));
    if (!isIconNameArray(mustHaveIcons)) { throw Error(`mustHaveIcons must be array of icon names`) };
    if (!isIconSTyle(iconStyle)) throw Error(`Not iconStyle: "${iconStyle}"`);

    // debugger;
    mustHaveIcons.forEach(icon => addToUsedIcons(icon));

    let strNetworkErr = "";
    mdcIconStyle = iconStyle;
    const onInternet = await onPublicInternet();
    if (!onInternet) {
        strNetworkErr = "off Internet";
    }
    if ("" == strNetworkErr)
        try {
            await getIconsInMyWoffFile();
        } catch (err) {
            console.log("err:", err);
            if (err instanceof Error) {
                strNetworkErr = err.message;
            } else {
                strNetworkErr = String(err);
            }
        }
    if ("" != strNetworkErr) {
        console.error("initMdcIcons:", strNetworkErr);
        btnWoff2.textContent = `Woff2: ${strNetworkErr}`;
        btnWoff2.style.outline = "2px dotted red";
        btnWoff2.style.pointerEvents = "none";
        return;
    }
}

// debugger;
const myDir = new URL('./', import.meta.url).href;

// FIX-ME: What format do I need here:
const urlMyWoff2File = `${myDir}woff2/my-symbols.woff2`;


/* * @param {string} iconName */
// export function addToUsedIcons(iconName) { OLDsetMdcIconsUsed.add(iconName); }

function getOurMdcIconsList() {
    if (setMdcIconsUsed.has("")) debugger;
    return [...setMdcIconsUsed].sort().join(",");
}

/**
 * @param {string} action
 */
async function checkWoff2icons(action) {
    // debugger;
    if (!["justCheck", "dialog"].includes(action)) throw Error(`Unknown action parameter: "${action}"`);
    const myMdcWoffSymbolsList = await getMdcSymbolsInWoff2File(urlMyWoff2File);
    const hasWoffIcons = myMdcWoffSymbolsList != undefined;

    // FIX-ME: Why did I need two variables for this? Do I still need that???
    const setIconsInWoff2File = setIconsInMyWoff2File;
    const foundWoff2File = setIconsInMyWoff2File.size > 0;
    setIconsInWoff2File.add("edit"); // FIX-ME: mapping codepoints problem
    setIconsInWoff2File.add("favorite"); // FIX-ME: mapping codepoints problem

    const setIconsMissing = new Set();
    setMdcIconsUsed.forEach(sym => {
        if (!setIconsInWoff2File.has(sym)) { setIconsMissing.add(sym); }
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
    const woff2 = [...setIconsInWoff2File].sort().join(", ");
    window.console.log(`Missing in woff file: "${missing}",\nsee console for .woff download link`);

    // alert(`Missing in woff file: "${missing}",\nsee console for .woff download link`);
    /**
     * @param {string} txt 
     * @returns {HTMLSpanElement}
     */
    const makeGroupLabel = (txt) => {
        const elt = mkElt("span", undefined, txt);
        elt.style.fontWeight = "bold";
        elt.style.fontSize = "1.1rem";
        return elt;
    }
    const aDownload = mkElt("a", { href: linkWOFF2 }, "Download a new WOFF2 file");
    aDownload.style = `
        text-decoration: underline;
    `;
    aDownload.title = "- Download WOFF2 file";
    const eltDownload = mkElt("div", undefined, [
        aDownload,
        mkElt("p", undefined, [
            "Then ",
            foundWoff2File ? "replace" : "add",
            // "replace or add",
            " the file at ",
            mkElt("div", { style: "font-weight:bold;margin-top:0.3rem;" }, urlMyWoff2File)
        ])
    ]);
    console.log({ urlWoff2File: urlMyWoff2File });
    eltDownload.style = `
        padding: 10px;
        margin-top: 20px;
        border-radius: 10px;
        background-color: yellowgreen;
        color: black;
    `;
    const divWoff2 = mkElt("div", undefined, [makeGroupLabel(`WOFF2 file (${setIconsInWoff2File.size}): `), `${woff2}`]);
    if (foundWoff2File) {
        divWoff2.appendChild(mkElt("div", { style: "font-style:italic; padding-left:2rem;" },
            "(WOFF2 file exists)"));
    } else {
        divWoff2.appendChild(mkElt("div", { style: "font-style:italic; padding-left:2rem;" },
            "(There is no real WOFF2 file yet)"));
    }
    const linkedSheets = [...document.querySelectorAll("link[rel=stylesheet]")];
    console.log("linkedSheets:", linkedSheets);
    // debugger;
    const arrGoogleSymbolsLinks = linkedSheets.filter(elt => {
        if (!(elt instanceof HTMLLinkElement)) throw Error("not link");
        const u = new URL(elt.href);
        const found = u.hostname == "fonts.googleapis.com"
            && u.pathname == "/css2"
            ;
        return found;
    });
    console.log("arrGoogleSymbols:", arrGoogleSymbolsLinks);
    const arrMyWoff2Links = linkedSheets.filter(elt => {
        if (!(elt instanceof HTMLLinkElement)) throw Error("not link");
        const u = new URL(elt.href);
        // debugger;
        const found =
            u.pathname.endsWith("/my-symbols.woff2");
        ;
        return found;
    });
    console.log("arrMyWoff2Links:", arrMyWoff2Links);

    // debugger;
    const divStylesheetStatus = mkElt("div");
    switch (arrGoogleSymbolsLinks.length) {
        case 0:
            divStylesheetStatus.appendChild(mkElt("div", {style:"font-weight:bold;"}, "No google font link"));
            break;
        case 1:
        default:
            divStylesheetStatus.appendChild(mkElt("div", {style:"font-weight:bold;"}, "Google font links:"));
            const ul = mkElt("ul");
            ul.style.paddingLeft = "1.3rem";
            ul.style.marginTop = "0px";
            ul.style.fontStyle = "italic";
            arrGoogleSymbolsLinks.forEach(link => {
                const li = mkElt("li", undefined, link.outerHTML);
                ul.appendChild(li);
            })
            divStylesheetStatus.appendChild(ul);

    }
    switch (arrMyWoff2Links.length) {
        case 0:
            divStylesheetStatus.appendChild(mkElt("div", {style:"font-weight:bold;"}, "No woff2 link"));
            break;
        case 1:
        default:
            divStylesheetStatus.appendChild(mkElt("div", {style:"font-weight:bold;"}, "Woff2 links:"));
            const ul = mkElt("ul");
            ul.style.paddingLeft = "1.3rem";
            ul.style.marginTop = "0px";
            ul.style.fontStyle = "italic";
            arrMyWoff2Links.forEach(link => {
                const li = mkElt("li", undefined, link.outerHTML);
                ul.appendChild(li);
            })
            divStylesheetStatus.appendChild(ul);
    }

    const detInstructions = mkElt("details", { class: "summary-marker-after" }, [
        mkElt("summary", undefined, "Help"),
        mkElt("p", undefined,
            `
            There should either be a link to google symbol font (around 1MB)
            or a link to the woff2 file (a few kB).
            `),
        mkElt("h6", undefined, "I found those:"),
        divStylesheetStatus,
    ]);
    const bdy = mkElt("div", undefined, [
        mkElt("p", { style: "font-weight:bold; font-size:1.25rem;" }, "Missing Material Symbols"),
        mkElt("div", undefined, [makeGroupLabel(`Used (${setMdcIconsUsed.size}): `), `${used}`]),
        // mkElt("div", undefined, [makeGroupLabel(`WOFF2 (${setIconsInWoff2File.size}): `), `${woff2}`]),
        divWoff2,
        mkElt("div", undefined, [makeGroupLabel(`Missing (${setIconsMissing.size}): `), `${missing}`]),
        eltDownload,
        detInstructions,
    ]);
    // showDialog(bdy);
    const dlg = mkElt("dialog", undefined, bdy);
    dlg.style.backgroundColor = "blue";
    dlg.style.color = "white";
    dlg.style.opacity = "1";
    dlg.style.outline = "1px solid white";
    document.documentElement.appendChild(dlg);
    dlg.showModal();
    // syncViewPort();
}

/**
 * @param {string} woffUrl 
 * @returns {Promise<string|undefined>}
 */
async function getMdcSymbolsInWoff2File(woffUrl) {
    // debugger;
    // const modWoffCodepoints = await importFc4i("woff-codepoints");
    const modWoffCodepoints = await import("./woff-codepoints.js");
    const codepoints = await modWoffCodepoints.getCodepoints(woffUrl);
    if (!codepoints) return;


    // const modWoff2MdcSymbols = await importFc4i("woff2-mdc-symbols");
    const modWoff2MdcSymbols = await import("./woff2-mdc-symbols.js");
    /** @type {Record<string,string>} */
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



    /////// Make it easy to dismiss the "Get new Woff2"-button:

    // 1. Set to manual to prevent native browser engine flashes
    btnWoff2.setAttribute("popover", "manual");
    document.body.appendChild(btnWoff2);
    btnWoff2.showPopover();

    // Define a unified cleanup function
    const cleanupSymbolsPopover = () => {
        btnWoff2.remove();
        document.removeEventListener('click', outsideClickListener, true);
        document.removeEventListener('keydown', escapeKeyListener, true);
    };

    // 2. The outside click handler
    const outsideClickListener =
        /** @param {MouseEvent} event */
        (event) => {
            if (!btnWoff2.contains(/** @type {Node} */(event.target))) {
                cleanupSymbolsPopover();
            }
        };

    // 3. The Escape key handler
    const escapeKeyListener =
        /** @param {KeyboardEvent} event */
        (event) => {
            if (event.key === 'Escape') {
                cleanupSymbolsPopover();
            }
        };

    // 4. Attach both handlers using the capture phase (true)
    document.addEventListener('click', outsideClickListener, true);
    document.addEventListener('keydown', escapeKeyListener, true);



    btnWoff2.style.inset = "auto";
    btnWoff2.style.margin = "0";
    btnWoff2.style.bottom = "15px";
    btnWoff2.style.right = "15px";
    btnWoff2.addEventListener("click",
        /** @param {MouseEvent} evt */
        evt => {
            evt.stopPropagation();
            btnWoff2.remove();
            checkWoff2icons("dialog");
        });
}


let iconsForApp = "";

/**
 * param {string} whichApp 
 * /
export function setMdcIconsFor(whichApp) {
    iconsForApp = whichApp;
    saveStoredIconsUsed();
}
*/


const keyUsedIcons = () => { return `mdc-symbols-used-${urlMyWoff2File}`; }
const keyMustHaveIcons = () => { return `mdc-symbols-must-have-${urlMyWoff2File}`; }

function getStoredIconsUsed() {
    const keyIconsUsed = keyUsedIcons();
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
    localStorage.setItem(keyUsedIcons(), [...setMdcIconsUsed].sort().join(","));
}


async function mkWOFF2downloadLink() {
    const ourIcons = getOurMdcIconsList();
    if (0 == mdcIconStyle.length) {
        const msg = "Icon style has not been set (call initMdcIcons)";
        console.error(msg);
        debugger;
        throw Error(msg);
    }
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

/**
 * returns {Promise<Set>}
 */
async function getIconsInMyWoffFile() {
    const woffIconsList = await getMdcSymbolsInWoff2File(urlMyWoff2File);
    const hasWoffIcons = woffIconsList != undefined;

    // return new Set(hasWoffIcons ? woffIconsList.split(",") : undefined);
    // let theSet = new Set(hasWoffIcons ? woffIconsList.split(",") : undefined);
    // setIconsInMyWoff2File = theSet;

    setIconsInMyWoff2File.clear();
    if (hasWoffIcons) {
        woffIconsList.split(",").forEach(iconName => {
            setIconsInMyWoff2File.add(iconName);
        })
    }
}



/** @typedef {Record<string, string>[]} CodePoints */

/** @returns {Promise<CodePoints>} */
async function getCodepoints() {
    const response = await fetch('https://cdn.jsdelivr.net/npm/material-icons@latest/iconfont/codepoints.json');
    // console.log("after fetch");
    const codepoints = await response.json();
    // console.log("after response");
    return codepoints;
}

/** @type {CodePoints} */
const codepoints = await getCodepoints();
const hasHome = await checkIcon("home");
console.log("hasHome:", hasHome);

/**
 * @param {string} iconName
 * @returns {Promise<boolean>}
 */
async function checkIcon(iconName) {
    // const response = await fetch('https://cdn.jsdelivr.net/npm/material-icons@latest/iconfont/codepoints.json');
    // console.log("after fetch");
    // const codepoints = await response.json();
    // console.log("after response");
    // return Object.prototype.hasOwnProperty.call(codepoints, iconName);
    return codepoints[iconName] != undefined
}
addToUsedIcons("edit_off"); // FIX-ME: Do I still need this?
addToUsedIcons("expand_more"); // Used in CSS for <details>/<summary>