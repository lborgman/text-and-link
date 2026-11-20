// global typedefs for exports

/** typedef {{ wrapper: HTMLDivElement, input: HTMLInputElement | HTMLTextAreaElement }} BearTextField */
/** @typedef {{ wrapper: HTMLDivElement, input: HTMLInputElement }} BearTextInputField */
/** @typedef {{ field: HTMLDivElement, textarea: HTMLTextAreaElement }} BearTextAreaField */
/** @typedef {{ wrapper: HTMLElement, input: HTMLInputElement }} BearSwitch */
/** @typedef {{ field: HTMLDivElement, select: HTMLSelectElement }} BearSelect */
/** @typedef {{ wrapper: HTMLElement, input: HTMLInputElement, funInit: (val:number) => void }} BearSlider */
/** @typedef {HTMLAnchorElement|HTMLButtonElement} BearChip */
/** @typedef {{ wrapper: HTMLElement, getSelected: () => string[] }} BearChipGroup */
/** @typedef {{ menu: HTMLElement, open: () => void, close: () => void }} BearMenu */ // FIX-ME: totally wrong
/** @typedef {{ nav: BearTabs, panelsContainer: HTMLDivElement, funSelect: (index: number) => void }} BearTabsObj */