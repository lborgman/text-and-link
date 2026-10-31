// @ts-check
// debugger;
const WOFF_CODEPOINTS_VER = "0.0.1";
window["logConsoleHereIs"](`here is woff-codepoints.js ${WOFF_CODEPOINTS_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module


/** @type {undefined|Promise<any[]>} */
let promCodePoints;

/**
 * @param {string} woffUrl 
 * @returns {Promise<any[]>}
 */
export function getCodepoints(woffUrl) {
    promCodePoints = promCodePoints || fontkitGetCodepoints(woffUrl);
    return promCodePoints;
}

/**
 * @param {string} woffUrl 
 * @returns {Promise<any[]>}
 */
async function fontkitGetCodepoints(woffUrl) {
    let response;
    try {
        response = await fetch(woffUrl);
    } catch (err) {
        console.error(woffUrl, err);
        throw Error(err);
        debugger; // eslint-disable-line no-debugger
    }
    if (!response.ok) {
        if (response.status == 404) return;
        debugger; // eslint-disable-line no-debugger
    }
    const arrayBuffer = await response.arrayBuffer();

    const fontkitUrl = "https://esm.sh/fontkit";
    const modFontkit = await (async () => {
        try {
            return await import(fontkitUrl);
        } catch (err) {
            console.error(err);
            throw Error(`Could not get fontkit: ${fontkitUrl}`);
        }
    })();

    const font = modFontkit.create(new Uint8Array(arrayBuffer));
    // console.log({ font });
    const codepoints = font.characterSet; // Array of codepoints (numbers)
    // console.log({ codepoints });
    return codepoints;
}
