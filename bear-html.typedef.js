// global typedefs for exports

/** @typedef {import("./bear-html.js").BearTabs} BearTabs */

/** typedef {{ wrapper: HTMLDivElement, input: HTMLInputElement | HTMLTextAreaElement }} BearTextField */
/** @typedef {{ container: HTMLDivElement, eltText: HTMLInputElement | HTMLTextAreaElement}} BearTextInputField */
/** @typedef {{ field: HTMLDivElement, textarea: HTMLTextAreaElement }} BearTextAreaField */
/** @typedef {{ container: HTMLElement, input: HTMLInputElement }} BearSwitch */
/** @typedef {{ field: HTMLDivElement, select: HTMLSelectElement }} BearSelect */
/** @typedef {{ container: HTMLElement, input: HTMLInputElement, funInit: (val:number) => void }} BearSlider */
/** @typedef {HTMLAnchorElement|HTMLButtonElement} BearChip */
/** @typedef {{ container: HTMLElement, getSelected: () => string[] }} BearChipGroup */
/** @typedef {{ menu: HTMLElement, open: () => void, close: () => void }} BearMenu */ // FIX-ME: totally wrong
/** @typedef {{ nav: BearTabs, panelsContainer: HTMLDivElement, funSelect: (index: number) => void }} BearTabsObj */



/**
 * @typedef {'neutral'|'tonalSpot'|'vibrant'|'expressive'|'fidelity'|'content'|'fruitSalad'|'rainbow'|'monochrome'} M3SchemeVariant
 */
/**
 * @typedef {{
 *   generateTheme: (baseInput: string, isDark?: boolean, variant?: M3SchemeVariant) => ColorThemeVariables,
 *   applyTheme: (colorTheme: ColorThemeVariables, targetElement?: HTMLElement) => void
 * }} BasicUI_ColorThemesAPI
 */

/** @type {BasicUI_ColorThemesAPI} */ var BasicUI_ColorThemes;

/** @type {MkEltFn} */ var mkElt;
/** @type {LogConsoleHereIs} */ var logConsoleHereIs;


/**
 * @typedef {{
 *   getJsDocForModule: (theModule: Record<string, any> & { [Symbol.toStringTag]: "Module" }, importName: string) => string,
 *   mkXclose: (funClose?: Function) => HTMLButtonElement,
 *   addXclose: (dialog: HTMLDialogElement) => void,
 *   OLDmkFabButton: (icon: any, title: string, small: boolean) => HTMLButtonElement,
 *   OLDmkIconButton: (icon: any, title: string) => HTMLButtonElement,
 *   showDialog: (bdy: HTMLDivElement, retValFun?: Function, buttons?: HTMLButtonElement[] | HTMLButtonElement, dialogClass?: string) => Promise<any>,
 *   showDialogConfirm: (bdy: HTMLDivElement, ok?: string, cancel?: string, funOkButton?: Function) => Promise<boolean>,
 *   closeMyDialog: (elt: HTMLElement) => void,
 *   nextPaint: (fun: Function) => Promise<void>,
 *   isCssVariableDefined: (variableName: string, className?: string) => boolean,
 *   mkDialogMenu: () => HTMLDialogElement,
 *   addMenuDivider: (dialogMenu: HTMLDialogElement) => void,
 *   addMenuAlt: (dialogMenu: HTMLDialogElement, txt: string | HTMLSpanElement, fun: () => void) => void,
 *   displayMenu: (dialogMenu: HTMLDialogElement, objDialogPosition: { parent: HTMLElement, relativeX?: string }) => void,
 *   getRootCssVarMs: (cssVar: string) => number,
 *   colorNameToHex: (colorName: string) => string | null,
 *   showHere: (txtOrDiv: string | HTMLDivElement, clientX: number, clientY: number, secTimeout?: number) => HTMLDivElement,
 *   snackbar: (msg: string | HTMLDivElement, secDur?: number) => void,
 *   openDialog: (dialog: HTMLDialogElement) => void,
 *   closeDialog: (dialog: HTMLDialogElement) => void,
 *   setMdcIconStyle: (iconStyle: string) => void,
 *   getMdcIconClass: () => string,
 *   mkMdcIcon: (iconName: string) => HTMLSpanElement,
 *   mkColorPickerSquare: () => HTMLInputElement,
 *   mkDoubleColorInputs: (bearInpColor: BearTextInputField, onAnyInput: () => void) => {
 *     inpColor: HTMLInputElement,
 *     colorPicker: HTMLInputElement,
 *     wrapper: HTMLSpanElement,
 *     funInitColor: (arg0: string) => void
 *   }
 * }} BasicUIModule
 */

/**
 * @typedef {object} BearFieldOptions
 * @property {string} [label] - Floating label text. Omit for no label.
 * @property {string} [value] - Initial value.
 * @property {string} [placeholder] - Needed for floating labels
 * @property {boolean} [border=false] - Use bordered style.
 * @property {boolean} [fill=false] - Use filled style. `border` and `fill` are
 *   mutually exclusive per Beer CSS; if both are set, `fill` wins.
 * @property {'small'|'medium'|'large'|'extra'} [size]
 * @property {string} [name]
 * @property {(value: string) => void} [onInput]
 */
