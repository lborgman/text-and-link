/*
    For testing basic-UI loading etc.

    Loading this file will define globalThis.waitUntilQuerySelector
*/

// @ts-ignore
const modBasic = await import("basic-ui");
const modBear = await import("bear-html");
// const modMdcIcons = (location.hostname == "localhost") ? await import("mdc-icons") : undefined;

// ---- style text for #basic-ui_debugVisual ----
const cssDebugVisual = `
    #basic-ui_debugVisual {
        h3 {
            NOcolor: red;
            font-size: 1.3rem;
            margin-bottom: 10px;
        }

        summary {
            color: #fff9;
            background-color: black;
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
const detailsCheckbox = () => mkElt("details", { open: "" }, [
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
// debugger;
const mySwitch = modBear.createSwitch({
    checked: true,
    // label: "switch"
});
const detailsSwitch = () => mkElt("details", { open: "" }, [
    mkElt("summary", undefined, " test-switch"),
    mkElt("div", undefined, mySwitch.container)
    // mySwitch.wrapper
]);

// ---- test-radio block ----
const detailsRadio = () => mkElt("details", { open: "" }, [
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
const sectionButton =
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
sectionButton.classList.add("surface");

const detailsTestButton = () => mkElt("details", { id: "test-button" }, [
    mkElt("summary", undefined, "test-button"),
    sectionButton
]);

// ---- test-icons block ----
const detailsTestIcons = () => mkElt("details", { id: "test-icons" }, [
    mkElt("summary", undefined, "test-icons"),
    mkElt("div", undefined, [])
]);



// ---- test-tabs block ----
const arrTabs = [];
for (let i = 0; i < 10; i++) {
    arrTabs.push(
        {
            label: `Tab${i}`,
            panel: mkElt("div", undefined, [
                `This is tab ${i} - `,
                mkElt("input", { type: "checkbox" })
            ])
        },
    )
}
// arrTabs.push({ label: `Tab text`, panel: `This is tab text` }); // for error testing

const objTabs = {
    tabs: arrTabs
}
const tabsExample = modBear.createTabs(
    objTabs
);
// const sectionTabs = mkElt("section", undefined,)
// tabsExample.nav.style.width = "fit-content";
const detailsTestTabs = () => mkElt("details", { id: "test-tabs" }, [
    mkElt("summary", undefined, "test-tabs"),
    mkElt("div", undefined,
        [
            tabsExample.nav,
            tabsExample.panelsContainer,
        ]
    )
]);


// ----- Test sliders ----
const sli1 = modBear.createSlider({
    // bad: true,
    min: 2, max: 8, step: 1, value: 4, showBubble: true,
});
/*
const sli1Copy = modBear.createSlider({
    min: 2, max: 8, step: 1, value: 4, showBubble: true,
});
document.body.appendChild(sli1Copy.wrapper);
debugger;
*/

const detailsTestSliders = () => mkElt("details", { id: "test-sliders" }, [
    mkElt("summary", undefined, "test-sliders"),
    mkElt("div", undefined,
        [
            mkElt("div", undefined,
                sli1.container
            )
        ])
]);
sli1.funInit(5);



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
    detailsSwitch(),
    detailsRadio(),
    detailsTestText(),
    detailsTestButton(),
    detailsTestIcons(),
    detailsTestTabs(),
    detailsTestSliders(),
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

/*
export function getEltDebugVisual() {
    return detailsDebugVisual();
}
export async function doTheTests() {
    debugger;
    const dv = await globalThis.waitUntilQuerySelector("#basic-ui_debugVisual",);
    debugger;
    doTheTestsInternal(dv);
}
*/

/** @param {HTMLDetailsElement} dv */
async function doTheTestsInternal(dv) {
    // scriptModule
    {
        /*
        function insertHere(output) {
            document.currentScript.parentNode.insertBefore(output, document.currentScript);
        }
        */
        const eltTestText = await globalThis.waitUntilQuerySelector("#test-text");
        if (!eltTestText) { throw Error("!eltTestText"); }
        const eltTestTextSection = /** @type {HTMLElement} */ (eltTestText.querySelector("section"));

        const eltTestButton = await globalThis.waitUntilQuerySelector("#test-button");
        if (!eltTestButton) { throw Error("!eltTestButton"); }
        const eltTestButtonSection = /** @type {HTMLElement} */ (eltTestButton.querySelector("section"));

        setTimeout(() => {
            eltTestText.addEventListener("change", evt => {
                const target = evt.target;
                if (!(target instanceof HTMLInputElement)) {
                    return;
                    debugger;
                }
                if (target.type != "checkbox") {
                    return;
                    debugger;
                }
                const divCont = target.closest("div");
                if (!(divCont instanceof HTMLDivElement)) {
                    debugger;
                    throw Error("divCont is not <div>");
                }
                const myDiv = divCont
                    .lastElementChild?.firstElementChild?.firstElementChild
                    ;
                if (!myDiv) {
                    debugger;
                    throw Error("!myDiv");
                }
                myDiv.classList.toggle("field");
            })
        }, 1000);
        const setTextOpts = new Set();
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
                        if (setTextOpts.has(jsonOpts)) {
                            debugger;
                        }
                        setTextOpts.add(jsonOpts);
                        // console.log({ border, label, fill, fieldOpts });
                        addTextExample(/** @type {BearFieldOptions} */(fieldOpts));
                    })
                })
            })
        });

        const setButtonOpts = new Set();
        // ["input", "textarea"].forEach(txtType => {
        // const txtTypeHeader = mkElt("h2", undefined, `<${txtType}>`);
        // txtTypeHeader.style.width = "90%";
        // txtTypeHeader.style.marginLeft = "20px";
        // eltTestTextSection.appendChild(txtTypeHeader);

        const icon = modBasic.mkMdcIcon("settings");
        const catchBtnError = new Set();
        [false, true].forEach(border => {
            [false, "Label"].forEach(label => {
                [false, icon].forEach(icon => {
                    [false, "fill", "primary", "secondary", "tertiary"].forEach(color => {
                        [false, 'round', 'square', 'circle', 'small-round'].forEach(shape => {
                            [false, "small", "medium", "large", "extra"].forEach(size => {
                                // [false, "Title"].forEach(title => 
                                const optsBtn = {};
                                // if (title) { btnOpts.title = title; }
                                if (label) { optsBtn.label = label; }
                                if (icon) {
                                    optsBtn.icon = icon;
                                    if (!label) { optsBtn.title = "dummy" }
                                }
                                if (border) { optsBtn.border = border; }
                                if (size) { optsBtn.size = size; }
                                if (color) { optsBtn.color = color; }
                                if (shape) { optsBtn.shape = shape; }
                                const jsonOpts = JSON.stringify(optsBtn);
                                if (setButtonOpts.has(jsonOpts)) {
                                    debugger;
                                }
                                setButtonOpts.add(jsonOpts);
                                if (!label && icon) debugger;
                                addButtonExample(optsBtn);
                            })
                        })
                    });

                })
            })
        });
        const divCatchBtnError = mkElt("div", { style: "background:red;color:yellow;padding:4px;" });
        catchBtnError.forEach(c => {
            const d = mkElt("div", undefined, c);
            divCatchBtnError.appendChild(d);
        })
        eltTestButtonSection.appendChild(divCatchBtnError);

        // const opts = { <textarea name="" id=""></textarea> }
        /**
         * @param {Object} btnOpts
         * @param {string|boolean} [btnOpts.label]
         * @param {HTMLSpanElement} [btnOpts.icon]
         * @param {string|boolean} [btnOpts.border]
         * @param {string|boolean} [btnOpts.size]
         * @param {string|boolean} [btnOpts.color]
         * @param {string|boolean} [btnOpts.shape]
         * @returns {undefined}
         */
        function addButtonExample(btnOpts) {
            const containerOpts = mkElt("span");
            containerOpts.style.backgroundColor = "yellow";
            containerOpts.style.color = "black";
            containerOpts.style.fontSize = "0.6rem";
            containerOpts.style.padding = "2px";
            containerOpts.style.display = "flex";
            containerOpts.style.flexWrap = "wrap";
            // containerOpts.style.gap = "1px";
            containerOpts.style.marginBottom = "4px";
            containerOpts.classList.add("surface");

            const containerBtn = mkElt("span");
            // const hasOpts = Object.keys(btnOpts).length > 0;
            // for (const key in btnOpts) {
            // const val = btnOpts[key];
            for (const [key, val] of Object.entries(btnOpts)) {
                const displayVal = val instanceof Node ? val.cloneNode(true) : val;
                const elt = mkElt("span", undefined, [`${key}: `, displayVal]);
                elt.style.border = "0.5px solid";
                elt.style.border = "none";
                elt.style.borderRadius = "2px";
                // elt.style.padding = "1px";
                containerOpts.appendChild(elt);
            }
            const container = mkElt("span", undefined, [containerOpts, containerBtn]);
            container.style.backgroundColor = "black";
            container.style.width = "100px";
            container.style.padding = "4px";
            try {
                const eltButton = modBear.createButton(btnOpts);
                containerBtn.appendChild(eltButton);
            } catch (err) {
                const txtErr = err.toString().slice(7);
                const arrKnownErr = [
                    "Neither title or label",
                    "Neither icon or label",
                    "label and shape",
                    "icon but no title or label",
                ];
                if (arrKnownErr.includes(txtErr)) { catchBtnError.add(txtErr); return; }
                debugger;
                containerBtn.textContent = txtErr;
                containerBtn.style.fontSize = "0.7rem";
                containerBtn.style.color = "red";
            }
            eltTestButtonSection.appendChild(container);
        }
        /** @param {BearFieldOptions} fieldOpts */
        function addTextExample(fieldOpts) {
            // debugger;
            const obj = modBear.createTextField(fieldOpts);
            const { container, eltText } = obj;
            const field = container.firstElementChild;
            let fieldClass = field.getAttribute("class");
            fieldClass = fieldClass.replace("field", "").trim();
            const divFieldClass = mkElt("div", undefined, fieldClass);
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
        /** @param {string} iconName */
        function insertIcon(iconName) {
            const eltIcon = mkElt("i", undefined, iconName);
            const spanName = mkElt("span", undefined, `${iconName}: `);
            // const eltTextIcon = mkElt("div", undefined, [iconName, ":", eltIcon]);
            spanName.style.opacity = "0.5";
            const eltTextIcon = mkElt("div", undefined, [spanName, eltIcon]);
            if (!divTestIcons) throw Error("!divTestIcons");
            divTestIcons.appendChild(eltTextIcon);
        }
        const divTestIcons = document.getElementById("test-icons")?.querySelector("div");
        if (divTestIcons == null) throw Error("divTestIcons == null");
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
    if (dvResult == null) throw Error("dvResult == null");

    /** * @param {string} txt */
    const problem = (txt) => {
        console.error("problem: ", txt);
        debugger;
        const eltErr = mkElt("p", undefined, txt);
        dvResult.append(eltErr);
        dvResult.style.display = "block";
    }

    /*
    // These tests does not work any more.
    const cb = await globalThis.waitUntilQuerySelector("input[type=checkbox]", dv);
    const cbRect = cb.getBoundingClientRect();
    if (cbRect.width > 2) { problem("Is beer.css loaded?"); }
    if (cbRect.width > 8) { problem("Is beer-native.css loaded after beer.css?"); }
    */


    const iIcon = await globalThis.waitUntilQuerySelector("i", dv);
    if (!iIcon) throw Error("!iIcon");
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
 * @param {HTMLElement} [fromElt] - The element to query from
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

    /** @param {(value: HTMLElement|null) => void} resolve */
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
            const element = /** @type {HTMLElement} */ (document.querySelector(CSSselector));
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
    const dv = /** @type {HTMLDetailsElement} */ (detailsDebugVisual());
    if (!dv) throw Error("!dv");
    const dvLast =/** @type {HTMLElement} */ (dv.lastElementChild);
    if (!dvLast) throw Error("!dvLast");
    const bdy = mkElt("div", undefined, [
        mkElt("h3", undefined, "Check basic-ui setup"),
        // dv.lastElementChild
        dvLast
    ]);
    bdy.id = "basic-ui_debugVisual";
    const oldBdy = document.getElementById(bdy.id);
    if (oldBdy) {
        const oldDialog = oldBdy.closest("dialog");
        oldDialog?.remove();
    }
    // export showDialog(bdy, retValFun, buttons, dialogClass) {
    modBasic.showDialog(bdy, undefined, undefined, "large");
    doTheTestsInternal(dv);
}