/*
    For testing basic-UI loading etc.

    Loading this file will define globalThis.waitUntilQuerySelector
*/

const modBasic = await import("basic-ui");

// ---- style text for #basic-ui_debugVisual ----
const cssDebugVisual = `
    #basic-ui_debugVisual {
        h3 {
            NOcolor: red;
            font-size: 1.3rem;
            margin-bottom: 10px;
        }

        summary {
            color: yellow;
            background-color: darkgreen;
            list-style-type: revert;
            padding: 4px;
            outline: 1px solid #0004;
            max-width: content;
        }

        input[type=text] {
            /* max-width: 140px; */
        }
    }
`;

// ---- style text for #test-text ----
const cssTestText = `
    #test-text {
        section>div {
            display: flex;
            flex-direction: column;
            outline: 4px dotted blue;
            padding: 8px;
            max-width: 250px;
        }
    }
`;


// ---- test-checkbox block ----
const detailsCheckbox = () => mkElt("details", undefined, [
    mkElt("summary", undefined, " test-checkbox"),
    mkElt("label", undefined, [
        mkElt("input", { type: "checkbox" }),
        mkElt("span", undefined, " Checkbox (span)")
    ]),
    mkElt("div", { style: "outline:blue solid 1px" }, [
        mkElt("label", undefined, [
            mkElt("input", { type: "checkbox" }),
            " Checkbox native"
        ])
    ])
]);

// ---- test-radio block ----
const detailsRadio = () => mkElt("details", undefined, [
    mkElt("summary", undefined, "test-radio"),
    mkElt("label", undefined, [
        mkElt("input", { type: "radio", name: "test", value: "1" }),
        mkElt("span", undefined, "One (span)")
    ]),
    mkElt("label", undefined, [
        mkElt("input", { type: "radio", name: "test", value: "2" }),
        mkElt("span", undefined, "Two (span)")
    ]),
    mkElt("div", { style: "outline:2px solid blue;" }, [
        mkElt("label", undefined, [
            mkElt("input", { type: "radio", name: "test", value: "3" }),
            " Three native"
        ])
    ])
]);

// ---- module script element ----
// const scriptModule = mkElt("script", { type: "module" }, scriptModuleText);

// ---- test-text block ----
const sectionText =
    mkElt("section", {
        style: `
            display:flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap:20px;
            NObackground-color: var(--surface);
            margin: 0;
            `
    }, [
        mkElt("style", undefined, cssTestText)
    ]);
sectionText.classList.add("surface");

const detailsTestText = () => mkElt("details", { id: "test-text" }, [
    mkElt("summary", undefined, "test-text"),
    sectionText
]);

// ---- test-icons block ----
const detailsTestIcons = () => mkElt("details", { open: "", id: "test-icons" }, [
    mkElt("summary", undefined, "test-icons"),
    mkElt("div", undefined, [])
]);


// ---- inner div.surface-variant ----
const divSurfaceVariant = () => mkElt("div", {
    // style: "outline:4px dotted red; padding:4px;",
    style: "padding:4px;",
    class: "surface-variant"
}, [
    mkElt("style", undefined, cssDebugVisual),
    // mkElt("h3", undefined, "Testing beer-native.js and beer-fields.js"),
    mkElt("div", {
        id: "testVisual-result",
        style: "display:none; background-color:yellow; color:red; padding:8px; border-radius: 0;"
    }),
    detailsCheckbox(),
    detailsRadio(),
    detailsTestText(),
    detailsTestIcons(),
]);

// ---- top-level details#basic-ui_debugVisual ----
const detailsDebugVisual = () => mkElt("details", { id: "basic-ui_debugVisual", open: "" }, [
    mkElt("summary", {
        style: "background:blue;color:white;display:inline;padding:6px;"
    }, "Debug beer-native"),
    divSurfaceVariant()
]);
// Append wherever needed, e.g.:
// document.body.appendChild(detailsDebugVisual);

export function getEltDebugVisual() {
    return detailsDebugVisual();
}
export async function doTheTests() {
    const dv = await globalThis.waitUntilQuerySelector("#basic-ui_debugVisual",);
    debugger;
    doTheTestsInternal(dv);
}

async function doTheTestsInternal(dv) {
    // scriptModule
    {
        const modBeerHtml = await import("beer-html");
        function insertHere(output) {
            document.currentScript.parentNode.insertBefore(output, document.currentScript);
        }
        // const eltTestText = document.getElementById("test-text");
        const eltTestText = await globalThis.waitUntilQuerySelector("#test-text");
        const eltTestTextSection = eltTestText.querySelector("section");
        setTimeout(() => {
            eltTestText.addEventListener("change", evt => {
                const target = evt.target;
                if (target.tagName != "INPUT") {
                    return;
                    debugger;
                }
                if (target.type != "checkbox") {
                    return;
                    debugger;
                }
                const divCont = target.closest("div");
                const myDiv = divCont
                    .lastElementChild
                    .firstElementChild
                    .firstElementChild
                    ;
                myDiv.classList.toggle("field");
            })
        }, 1000);
        const setOpts = new Set();
        ["input", "textarea"].forEach(txtType => {
            const txtTypeHeader = mkElt("h2", undefined, `<${txtType}>`);
            txtTypeHeader.style.width = "90%";
            txtTypeHeader.style.marginLeft = "20px";
            eltTestTextSection.appendChild(txtTypeHeader);

            [false, "Testing"].forEach(label => {
                [false, true].forEach(border => {
                    [false, true].forEach(fill => {
                        const fieldOpts = {};
                        fieldOpts.type = txtType;
                        if (border) { fieldOpts.border = true; }
                        if (label) { fieldOpts.label = label; }
                        if (fill) { fieldOpts.fill = true; }
                        const jsonOpts = JSON.stringify(fieldOpts);
                        if (setOpts.has(jsonOpts)) {
                            debugger;
                        }
                        setOpts.add(jsonOpts);
                        // console.log({ border, label, fill, fieldOpts });
                        addTextExample(fieldOpts);
                    })
                })
            })
        });
        const opts = {
            // <textarea name="" id=""></textarea>
        }
        // console.log(setOpts);
        // debugger;
        function addTextExample(fieldOpts) {
            // debugger;
            const { wrapper, input } = modBeerHtml.createTextField(fieldOpts);
            // console.log({ field, input });
            const field = wrapper.firstElementChild;
            let fieldClass = field.getAttribute("class");
            fieldClass = fieldClass.replace("field", "").trim();
            const divFieldClass = mkElt("div", undefined, fieldClass);
            // const divFieldClass = mkElt("div", undefined, field);
            divFieldClass.style = `
                background: blue;
                color: white;
                padding: 6px;
                border-radius: 8px;
                margin-bottom: 6px;
            `;
            const divOpts = mkElt("div", undefined, JSON.stringify(fieldOpts));
            divOpts.style = `
                background: red;
                color: yellow;
                overflow-wrap: break-word;
            `;
            field.style.margin = "0";
            const divTestTest = mkElt("div", undefined, [
                divFieldClass,
                // divOpts,
                field
            ]);
            divTestTest.style = `
                width: 120px;
                outline: greenyellow dashed 1px;
            `;
            // eltTestText.appendChild(divTestTest);
            // section
            eltTestTextSection.appendChild(divTestTest);
        }

    }
    // scriptIcons
    {
        // debugger; // script
        // BeerCSS’s smaller subset (from GitHub) typically includes:
        function insertIcon(iconName) {
            const eltIcon = mkElt("i", undefined, iconName);
            const spanName = mkElt("span", undefined, `${iconName}: `);
            // const eltTextIcon = mkElt("div", undefined, [iconName, ":", eltIcon]);
            spanName.style.opacity = "0.5";
            const eltTextIcon = mkElt("div", undefined, [spanName, eltIcon]);
            divTestIcons.appendChild(eltTextIcon);
        }
        const divTestIcons = document.getElementById("test-icons").querySelector("div");
        divTestIcons.classList.add("surface");
        divTestIcons.style.display = "flex";
        divTestIcons.style.flexWrap = "wrap";
        divTestIcons.style.gap = "10px";
        divTestIcons.style.padding = "10px";
        divTestIcons.style.outline = "dotted blue 1px";
        /*
        // Basic UI icons
        "home, menu, close, search, settings"
        // Navigation icons
        "arrow_back, arrow_forward, expand_more"
        // Common action icons
        "add, delete, edit, check, clear"
        // Status icons
        "info, warning, error"
        // Form icons
        "visibility, visibility_off"
        */
        [
            "add",
            "cancel",
            "check",
            "clear",
            "close",
            "delete",
            "done",
            "download",
            "edit",
            "error",
            "favorite",
            "filter_list",
            "help",
            "info",
            "menu",
            "print",
            "remove",
            "search",
            "share",
            "sort",
            "star",
            "upload",
            "visibility",
            "visibility_off",
            "warning"
        ]
            .forEach(n => insertIcon(n));

    }

    const dvResult = await globalThis.waitUntilQuerySelector("#testVisual-result");
    const problem = (txt) => {
        console.error("problem: ", txt);
        debugger;
        const eltErr = mkElt("p", undefined, txt);
        dvResult.append(eltErr);
        dvResult.style.display = "block";
    }

    const cb = await globalThis.waitUntilQuerySelector("input[type=checkbox]", dv);
    const cbRect = cb.getBoundingClientRect();
    if (cbRect.width > 2) { problem("Is beer.css loaded?"); }
    if (cbRect.width > 8) { problem("Is beer-native.css loaded after beer.css?"); }
    const iIcon = await globalThis.waitUntilQuerySelector("i", dv);
    const iRect = iIcon.getBoundingClientRect();
    console.log({ iIcon, iRect });
    if (iRect.width != iRect.height) {
        // This can be better. Check for woff2, etc.
        if (iRect.width > iRect.height * 1.3) {
            problem("Is beer-icons.css correct and loaded?");
        } else {
            problem("beer.css not loaded correctly");
        }
    }
}

/**
 * Waits for an element to be rendered in the DOM.
 * (https://www.sitelint.com/blog/javascript-and-wait-until-dom-element-exists)
 *
 * @param {string} CSSselector - The element or selector to wait for.
 * @param {HTMLElement} fromElt - The element to query from
 * @param {number} [timeout=1000] - The timeout in milliseconds.
 * @returns {Promise<HTMLElement|null>} A Promise that resolves with the element or null if the timeout is reached.
 */

function waitUntilQuerySelector(CSSselector, fromElt, timeout) {
    const tofSelector = typeof CSSselector
    if (tofSelector !== "string") {
        const msg = `typeof CSSselector should be "string", but is "${tofSelector}"`;
        console.error(msg);
        debugger;
        throw Error(msg);
    }
    fromElt = fromElt || document.documentElement;
    timeout = typeof timeout === "number" ? timeout : 1000;

    const waitForElement = (resolve) => {
        const startTime = window.performance.now();
        const checkElement = () => {
            const currentTime = window.performance.now();
            if (currentTime - startTime >= timeout) {
                // debugger;
                throw Error(`Did not find "${CSSselector}"`);
                resolve(null);
                return;
            }
            const element = document.querySelector(CSSselector);
            if (element) {
                resolve(element);
                return;
            }
            window.requestAnimationFrame(checkElement);
        };
        window.requestAnimationFrame(checkElement);
    };

    return new Promise(waitForElement);
}
globalThis.waitUntilQuerySelector = waitUntilQuerySelector;

export function checkSetupDialog() {
    const dv = detailsDebugVisual();
    const bdy = mkElt("div", undefined, [
        mkElt("h3", undefined, "Check basic-ui setup"),
        dv.lastElementChild
    ]);
    bdy.id = "basic-ui_debugVisual";
    const oldBdy = document.getElementById(bdy.id);
    if (oldBdy) {
        const oldDialog = oldBdy.closest("dialog");
        oldDialog.remove();
    }
    // export showDialog(bdy, retValFun, buttons, dialogClass) {
    modBasic.showDialog(bdy, undefined, undefined, "large");
    doTheTestsInternal(dv);
}