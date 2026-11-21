// global typedefs for exports

/** @typedef {import("./bear-html.js").BearTabs} BearTabs */

/** typedef {{ wrapper: HTMLDivElement, input: HTMLInputElement | HTMLTextAreaElement }} BearTextField */
/** @typedef {{ container: HTMLDivElement, input: HTMLInputElement }} BearTextInputField */
/** @typedef {{ field: HTMLDivElement, textarea: HTMLTextAreaElement }} BearTextAreaField */
/** @typedef {{ wrapper: HTMLElement, input: HTMLInputElement }} BearSwitch */
/** @typedef {{ field: HTMLDivElement, select: HTMLSelectElement }} BearSelect */
/** @typedef {{ wrapper: HTMLElement, input: HTMLInputElement, funInit: (val:number) => void }} BearSlider */
/** @typedef {HTMLAnchorElement|HTMLButtonElement} BearChip */
/** @typedef {{ wrapper: HTMLElement, getSelected: () => string[] }} BearChipGroup */
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