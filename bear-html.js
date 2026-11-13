// @ts-check

/**
 * bear-html.js - Not beer, but bear
 *
 * Utility functions for building Beer CSS form field markup (text input,
 * textarea, switch) without depending on Beer CSS's own JS module.
 *
 * Beer CSS reference: https://github.com/beercss/beercss/blob/main/docs
 */

// @ts-ignore
const mkElt = window["mkElt"];

const modCustElts = await import("custom-elts-helpers");
// debugger;
// class x
class BearRange extends modCustElts.withSafeInit(HTMLInputElement) {
    onVisibleInit() {
        updateRange(this);
    }
}

// ---------------------------------------------------------------------------
// Shared internals
// ---------------------------------------------------------------------------

/**
 * @typedef {object} FieldOptions
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

let uidCounter = 0;

/**
 * Generates a reasonably unique id for linking labels to controls.
 * @param {string} prefix
 * @returns {string}
 */
function nextId(prefix) {
    uidCounter += 1;
    return `${prefix}-${uidCounter}`;
}

/**
 * Wires up the shared floating-label behavior for a field's input/textarea
 * and its label: toggles `.active` on both when the control is focused or
 * has a non-empty value. Replaces the need for Beer CSS's own JS module.
 * @param {HTMLInputElement|HTMLTextAreaElement} control
 * @param {HTMLLabelElement|null} labelEl
 */
/**
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} control
 * @param {HTMLLabelElement|null} labelEl
 */
function wireFloatingLabel(control, labelEl) {
    if (!labelEl) return;

    const sync = () => {
        const active = document.activeElement === control || control.value.length > 0;
        control.classList.toggle('active', active);
        labelEl.classList.toggle('active', active);
    };

    control.addEventListener('focus', sync);
    control.addEventListener('blur', sync);
    control.addEventListener('input', sync);
    sync();
}

/**
 * Builds the `.field` wrapper and optional `<label>` shared by text inputs
 * and textareas.
 * @param {FieldOptions} options
 * @param {boolean} isTextarea
 * @returns {{ field: HTMLDivElement, label: HTMLLabelElement|null }}
 */
function buildField({ label, border, fill, size }, isTextarea) {
    const field = document.createElement('div');
    // if (label) { debugger; }
    field.className = [
        'field',
        label && 'label',
        // fill ? 'fill' : border && 'border',
        border && "border",
        fill && "fill",
        // isTextarea && 'textarea',
        // size,
    ]
        // .filter(Boolean)
        .join(' ');

    let labelEl = null;
    if (label) {
        const tofLabel = typeof label;
        if ("string" != tofLabel) {
            const msg = `options.label should be string, is "${tofLabel}"`;
            console.error(msg);
            debugger;
            throw Error(msg);
        }
        labelEl = document.createElement('label');
        labelEl.textContent = label;
    }

    return { field, label: labelEl };
}




// ---------------------------------------------------------------------------
// Text field
// ---------------------------------------------------------------------------

/**
 * Creates a Beer CSS styled text input, wrapped in its required field markup.
 * @param {FieldOptions & { type?: string }} [options]
 * @returns {{ wrapper: HTMLDivElement, input: HTMLInputElement | HTMLTextAreaElement }}
 */
export function createTextField({
    value = '',
    placeholder = " ",
    name,
    onInput,
    ...rest
} = {}) {
    const { field, label } = buildField(rest, false);
    const fieldType = rest.type || 'input';

    const eltText = document.createElement(fieldType);
    /*
    if (eltText instanceof HTMLInputElement) {
        eltText.type = "text";
        eltText.value = value;
        if (name) eltText.name = name;
    }
    if (eltText instanceof HTMLTextAreaElement) {
        eltText.value = value;
        if (name) eltText.name = name;
    }
    */
    if (eltText instanceof HTMLInputElement) {
        eltText.type = "text";
        eltText.value = value;
        if (name) eltText.name = name;
    } else if (eltText instanceof HTMLTextAreaElement) {
        eltText.value = value;
        if (name) eltText.name = name;
    } else {
        throw Error("bad eltText");
    }

    eltText.setAttribute("placeholder", placeholder);

    field.append(eltText);
    if (label) field.append(label);

    wireFloatingLabel(eltText, label);

    if (onInput) {
        eltText.addEventListener('input', () => onInput(eltText.value));
    }

    /*
    The wrapper becomes the containing block for the absolutely‑positioned floating label.
    Without the wrapper, the label sizes itself relative to a higher‑level layout container,
    so its width and line length become unpredictable.

    By wrapping the field, the label’s geometry is computed relative to the wrapper’s width, making the floating‑label line consistent and correct.”

    Note: This is needed only for label+border. FIX-ME:
    */
    const wrapper = mkElt("div", undefined, field);
    return { wrapper, input: eltText };
}

// ---------------------------------------------------------------------------
// Textarea field
// ---------------------------------------------------------------------------

/**
 * Creates a Beer CSS styled textarea, wrapped in its required field markup.
 * Auto-resizes height to fit content as the user types.
 * @param {FieldOptions & { rows?: number, maxHeight?: number }} [options]
 * @returns {{ field: HTMLDivElement, textarea: HTMLTextAreaElement }}
 */
export function createTextareaField({
    value = '',
    name,
    rows = 1,
    maxHeight,
    onInput,
    ...rest
} = {}) {
    const { field, label } = buildField(rest, true);

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.rows = rows;
    if (name) textarea.name = name;

    field.append(textarea);
    if (label) field.append(label);

    wireFloatingLabel(textarea, label);

    const resize = () => {
        textarea.style.height = 'auto';
        const next = textarea.scrollHeight;
        textarea.style.height = `${maxHeight ? Math.min(next, maxHeight) : next}px`;
    };
    textarea.addEventListener('input', resize);
    resize();

    if (onInput) {
        textarea.addEventListener('input', () => onInput(textarea.value));
    }

    return { field, textarea };
}

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------

/**
 * Creates a toggle switch: a checkbox input styled as an on/off switch.
 * Assumes CSS targets `input[type="checkbox"].switch` (or similar) for the
 * switch look, separate from the selector used for plain checkboxes.
 * @param {object} [options]
 * @param {boolean} [options.checked=false]
 * @param {string} [options.label] - Optional label text shown next to the switch.
 * @param {string} [options.name]
 * @param {(checked: boolean) => void} [options.onChange]
 * @returns {{ wrapper: HTMLElement, input: HTMLInputElement }}
 */
export function createSwitch({
    checked = false,
    // label,
    name,
    // onChange
} = {}) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    // input.className = 'switch';
    input.checked = checked;
    input.setAttribute("aria-hidden", "true");
    if (name) input.name = name;

    // const wrapper = input;

    // if (label) {
    //     const id = nextId('switch');
    //     input.id = id;

    //     const container = document.createElement('div');
    //     container.className = 'switch-field';

    //     const labelEl = document.createElement('label');
    //     labelEl.htmlFor = id;
    //     labelEl.textContent = label;

    //     container.append(input, labelEl);
    //     wrapper = container;
    // }
    const wrapper = mkElt("label", { class: "switch" }, [input, mkElt("span")]);

    /*
    if (onChange) {
        input.addEventListener('change', () => onChange(input.checked));
    }
    */

    return { wrapper, input };
}

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

/**
 * @typedef {object} SelectOption
 * @property {string} value
 * @property {string} label
 */

/**
 * Creates a Beer CSS styled `<select>`, wrapped in its required field markup.
 * Reuses the same field/label helpers as the text field.
 * @param {FieldOptions & { options: SelectOption[], onChange?: (value: string) => void }} options
 * @returns {{ field: HTMLDivElement, select: HTMLSelectElement }}
 */
export function createSelect({ options, value, name, onChange, ...rest } = { options: [] }) {
    const { field, label } = buildField(rest, false);

    const select = document.createElement('select');
    if (name) select.name = name;

    for (const opt of options) {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        select.append(optionEl);
    }

    if (value !== undefined) select.value = value;

    field.append(select);
    if (label) field.append(label);

    // A <select> is never "empty" the way a text input can be, but focus/blur
    // still matters for the border/label treatment, so reuse the same wiring.
    wireFloatingLabel(select, label);
    select.addEventListener('change', () => {
        select.classList.add('active');
        if (label) label.classList.add('active');
    });

    if (onChange) {
        select.addEventListener('change', () => onChange(select.value));
    }

    return { field, select };
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------

/** @typedef {("tiny"|"small"|"medium"|"large"|"extra")} SliderSize */
/** @typedef {("vertical"|"horizontal")} SliderDirection */

/**
 * Creates a slider (`<input type="range">`) with a value bubble that tracks
 * the thumb position as it's dragged. Assumes CSS restyles the bare range
 * input directly (same approach as your checkbox/radio CSS) — no field
 * wrapper markup is required for the input itself.
 * @param {object} [options]
 * @param {number} [options.min=0]
 * @param {number} [options.max=100]
 * @param {number} [options.step=1]
 * @param {number} [options.value]
 * @param {string} [options.name]
 * @param {boolean} [options.showBubble=true]
 *
 * @param {SliderSize} [options.size=tiny]
 * @param {SliderDirection} [options.direction=horizontal]
 *
 * @param {(value: number) => void} [options.onInput]
 * @param {number} [options.onInputThrottleMs]
 * @param {(value: number) => void|null} [options.onChange]
 * @returns {{ wrapper: HTMLElement, input: HTMLInputElement }}
 */
export function createSlider({
    min = 0,
    max = 100,
    step = 1,
    value,
    name,
    showBubble = true,
    size = "tiny",
    direction = "horizontal",
    onInput,
    onInputThrottleMs,
    onChange,
} = {}) {
    // console.warn("createSlider");
    // console.log("%cis there a custom element defined:", "color:red;", customElements.get('bear-range'));
    // const input = document.createElement('input');


    // const input = document.createElement('bear-range');
    const input = /** @type {HTMLInputElement} */ (
        document.createElement('input', { is: 'bear-range' })
    );
    input.setAttribute('is', 'bear-range'); // only if you want CSS like input[is="bear-range"] to match


    // console.log("%cinput", "color:green", input);
    // console.log("%cinput.outerHTML", "color:green", input.outerHTML);
    // console.log("%cinput.constructor", "color:green", input.constructor);
    // console.log("%cinput.constructor.name", "color:green", input.constructor.name);
    // console.log("%cinput instanceof BearRange", "color:green", input instanceof BearRange);
    // console.log("%cinput customElements", "color:green", customElements.get('bear-range'));

    const Registered = customElements.get('bear-range');
    // console.log('%cregistered=', "color:yellow", Registered.name);
    // console.log('%csame class=', "color:yellow", Registered === BearRange);
    // console.log('%cinstanceof registered=', "color:yellow", input instanceof Registered);
    // debugger;



    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value ?? min);
    if (name) input.name = name;


    const wrapper = document.createElement('div');
    // wrapper.className = 'slider-field';
    wrapper.classList.add('slider');
    wrapper.classList.add(size);
    wrapper.classList.add(direction);

    wrapper.style.position = 'relative';
    wrapper.appendChild(input);

    const spanSelected = mkElt("span");
    wrapper.appendChild(spanSelected);

    if (showBubble) {
        const bubble = document.createElement('span');
        bubble.className = 'slider-bubble';
        wrapper.appendChild(bubble);

        const updateBubble = () => {
            const percent = (Number(input.value) - min) / (max - min);
            bubble.textContent = input.value;
            // Nudges the bubble to follow the thumb; the 8px fudge roughly accounts
            // for thumb radius so the bubble centers over it rather than the track.
            bubble.style.left = `calc(${percent * 100}% - ${percent * 16 - 8}px)`;
        };
        input.addEventListener('input', () => {
            updateBubble();
        });
        updateBubble();
    }
    if (onInput) {
        const handleInput =
            onInputThrottleMs ?
                throttle(onInput, onInputThrottleMs)
                :
                onInput;
        input.addEventListener('input', () => {
            handleInput(Number(input.value));
        });
    }
    if (onChange) {
        input.addEventListener('change', () => {
            onChange(Number(input.value));
        });
    }

    // console.warn("calling updateRange in createSlider");
    // setTimeout(() => { updateRange(input); }, 0);
    input.addEventListener("input", evt => {
        evt.stopPropagation();
        updateRange(input);
    });

    return { wrapper, input };
}
class BearRangeOLD extends HTMLInputElement {
    constructor() {
        console.log("%cCalling BearRange super", "font-size:18px;color:red;");
        super();
    }
    OLDconnectedCallback() {
        // This fires the moment the input enters the DOM
        console.log("%cBearRange connected!", "font-size:18px;color:green;");
        // updateRange(this);
        setTimeout(() => {
            requestAnimationFrame(() => {
                console.log(this.offsetWidth);
                updateRange(this);
            });
        }, 300);
        // debugger;
    }
    // }
    // class MyComponent extends HTMLElement {
    connectedCallback() {
        // 1. Yield to the browser to calculate layout and styles
        requestAnimationFrame(() => {

            // 2. Perform a strict visibility check
            const isReadyForInit = this.checkVisibility({
                opacityProperty: true,       // Returns false if opacity: 0
                visibilityProperty: true,    // Returns false if visibility: hidden
                // contentVisibilityProperty: true // Returns false if skipped by content-visibility
            });

            if (!isReadyForInit) {
                // 3. Fallback: Postpone initialization until it actually becomes visible
                this.#waitForVisibility();
                return;
            }

            // 4. Safe to initialize: Element is visible and has a layout box
            this.#initialize();
        });
    }

    #initialize() {
        console.log("Safe initialization executed. No layout errors will occur.");
        // Run your error-prone measurement, layout, or canvas code here
        updateRange(this);
    }

    #waitForVisibility() {
        console.warn("Component attached but hidden. Postponing setup to prevent errors.");

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                observer.disconnect(); // Clean up memory immediately
                this.#initialize();
            }
        });

        observer.observe(this);
    }
}

// customElements.define('my-component', MyComponent);





// You must specify which native tag you are extending
// console.log("%cbefore define bear-range", "color:red;");
customElements.define('bear-range', BearRange, { extends: 'input' });
// console.log("%cafter define bear-range", "color:red;");


// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------

/**
 * Creates a single Beer CSS chip (`<a class="chip">` or `<button class="chip">`).
 * @param {object} [options]
 * @param {string} [options.label]
 * @param {string | Node} [options.icon] - Material icon name or icon element shown before the label.
 * @param {boolean} [options.selected=false]
 * @param {boolean} [options.asButton=false] - Use `<button>` instead of `<a>`.
 * @param {(selected: boolean) => void} [options.onToggle]
 * @returns {HTMLElement}
 */
export function createChip({
    label,
    icon,
    selected = false,
    asButton = false,
    onToggle,
} = {}) {
    const chip = document.createElement(asButton ? 'button' : 'a');
    chip.className = `chip${selected ? ' fill' : ''}`;
    if (asButton) chip.type = 'button';

    if (icon) {
        // const iconEl = document.createElement('i');
        // iconEl.textContent = icon;
        // const iconEl = mkIconElt(icon);
        // chip.append(iconEl);
        chip.append(icon);
    }

    if (label) {
        const span = document.createElement('span');
        span.textContent = label;
        chip.append(span);
    }

    chip.addEventListener('click', () => {
        const nowSelected = !chip.classList.contains('fill');
        chip.classList.toggle('fill', nowSelected);
        if (onToggle) onToggle(nowSelected);
    });

    return chip;
}

/**
 * Creates a row of chips behaving as a single-select or multi-select group.
 * @param {object} options
 * @param {{ value: string, label: string, icon?: string }[]} options.items
 * @param {'single'|'multi'} [options.mode='single']
 * @param {string|string[]} [options.selected] - Initial selected value(s).
 * @param {(selected: string[]) => void} [options.onChange]
 * @returns {{ wrapper: HTMLElement, getSelected: () => string[] }}
 */
export function createChipGroup({ items, mode = 'single', selected, onChange } = { items: [] }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chip-group';

    const initiallySelected = new Set(
        Array.isArray(selected) ? selected : selected ? [selected] : []
    );

    const chips = new Map();

    const emitChange = () => {
        if (onChange) onChange([...chips.entries()].filter(([, c]) => c.classList.contains('fill')).map(([v]) => v));
    };

    for (const item of items) {
        const chip = createChip({
            label: item.label,
            icon: item.icon,
            selected: initiallySelected.has(item.value),
            asButton: true,
            onToggle: (nowSelected) => {
                if (mode === 'single' && nowSelected) {
                    for (const [otherValue, otherChip] of chips) {
                        if (otherValue !== item.value) otherChip.classList.remove('fill');
                    }
                }
                emitChange();
            },
        });
        chips.set(item.value, chip);
        wrapper.append(chip);
    }

    return {
        wrapper,
        getSelected: () => [...chips.entries()].filter(([, c]) => c.classList.contains('fill')).map(([v]) => v),
    };
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

/**
 * Creates a dropdown menu attached to a trigger element: opens on trigger
 * click, closes on outside click or Escape, and positions itself just below
 * the trigger. This is genuine interactive-component logic (unlike the
 * field helpers above), not just a class toggle.
 * @param {object} options
 * @param {HTMLElement} options.trigger - Element that opens the menu on click.
 * @param {{ label: string, icon?: string | Node, onSelect?: () => void }[]} options.items
 * @returns {{ menu: HTMLElement, open: () => void, close: () => void }}
 */
export function createMenu({ trigger, items }) {
    const menu = document.createElement('menu');
    // menu.style.position = 'absolute';
    // menu.style.display = 'none';

    for (const item of items) {
        const row = document.createElement('a');
        row.className = 'row';
        if (item.icon) {
            // const iconEl = document.createElement('i');
            // iconEl.textContent = item.icon;
            // const iconEl = mkIconElt(item.icon);
            // row.append(iconEl);
            row.append(item.icon);
        }
        const span = document.createElement('span');
        span.textContent = item.label;
        row.append(span);
        row.addEventListener('click', () => {
            if (item.onSelect) item.onSelect();
            close();
        });
        menu.append(row);
    }

    function positionMenu() {
        const rect = trigger.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;
    }

    /* * @param {MouseEvent} event * /
    function onOutsideClick(event) {
        if (!menu.contains(event.target) && event.target !== trigger) close();
    }
    */
    /** @param {MouseEvent} event */
    function onOutsideClick(event) {
        const target = /** @type {Element} */ (event.target);

        if (!menu.contains(target) && target !== trigger) close();
    }

    /** @param {KeyboardEvent} event */
    function onKeydown(event) {
        if (event.key === 'Escape') close();
    }

    function open() {
        positionMenu();
        menu.style.display = '';
        document.addEventListener('click', onOutsideClick, { capture: true });
        document.addEventListener('keydown', onKeydown);
    }

    function close() {
        menu.style.display = 'none';
        document.removeEventListener('click', onOutsideClick, { capture: true });
        document.removeEventListener('keydown', onKeydown);
    }

    trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (menu.style.display === 'none') open();
        else close();
    });

    // document.body.append(menu);

    return { menu, open, close };
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

/**
 * Creates a tab strip that swaps visible panel content and moves an
 * indicator to the active tab.
 * @param {object} options
 * @param {{ label: string, panel: HTMLElement }[]} options.tabs
 * @param {number} [options.initial=0]
 * @param {(index: number) => void} [options.onChange]
 * @returns {{ nav: HTMLElement, panelsContainer: HTMLElement, select: (index: number) => void }}
 */
export function createTabs({ tabs, initial = 0, onChange }) {
    const nav = document.createElement('nav');
    nav.className = 'tabs';

    const panelsContainer = document.createElement('div');
    panelsContainer.className = 'tabs-panels';

    /** @type {HTMLAnchorElement[]} */
    const tabEls = [];

    tabs.forEach((tab, index) => {
        const tabEl = document.createElement('a');
        tabEl.className = 'tab';
        tabEl.textContent = tab.label;
        tabEl.addEventListener('click', () => select(index));
        nav.append(tabEl);
        tabEls.push(tabEl);

        tab.panel.style.display = 'none';
        panelsContainer.append(tab.panel);
    });

    /**
     * @param {number} index
     */
    function select(index) {
        tabEls.forEach((tabEl, i) => tabEl.classList.toggle('active', i === index));
        tabs.forEach((tab, i) => {
            tab.panel.style.display = i === index ? '' : 'none';
        });
        if (onChange) onChange(index);
    }

    select(initial);

    return { nav, panelsContainer, select };
}


/**
 * Creates a Beer CSS styled button.
 * @param {object} [options]
 * @param {string} [options.label] - Button text.
 * @param {HTMLSpanElement} [options.icon] - <span> element for icon, shown before the label. Ignored if `image` is set.
 * @param {string} [options.image] - Image URL shown instead of an icon (e.g. avatar, logo). Takes priority over `icon`.
 * @param {string} [options.imageAlt=''] - Alt text for `image`. Ignored if `decorative` is true.
 * @param {boolean} [options.decorative=false] - Marks `image` as purely ornamental (empty alt, hidden from assistive tech) rather than meaningful content.
 * @param {boolean} [options.border=false] - Outlined style instead of filled.
 * @param {boolean} [options.transparent=false] - Shape reveals only on hover/press; common for icon-only nav buttons.
 * @param {boolean} [options.extend=false] - FAB shows icon + label together instead of icon-only.
 * @param {'round'|'square'|'circle'|'small-round'} [options.shape]
 * @param {'small'|'large'|'extra'} [options.size]
 * @param {string} [options.color] - Color role class, e.g. 'primary', 'secondary', 'error', 'tertiary'.
 * @param {boolean} [options.responsive=false] - Full width on small screens.
 * @param {boolean} [options.noWave=false] - Disables the ripple/wave click effect.
 * @param {string|number} [options.badge] - Optional badge content overlaid on the button.
 * @param {string} [options.type='button'] - Native button type.
 * @param {() => void} [options.onClick]
 * @returns {HTMLButtonElement}
 */
export function createButton({
    label,
    icon,
    image,
    imageAlt = '',
    decorative = false,
    border = false,
    transparent = false,
    extend = false,
    shape,
    size,
    color,
    responsive = false,
    noWave = false,
    badge,
    type = 'button',
    onClick,
} = {}) {
    const button = /** @type {HTMLButtonElement} */ (document.createElement('button'));
    // button.type = type;
    button.setAttribute("type", type);
    button.className = [
        border && 'border',
        transparent && 'transparent',
        extend && 'extend',
        shape,
        size,
        color,
        responsive && 'responsive',
        noWave && 'no-wave',
    ]
        .filter(Boolean)
        .join(' ');

    if (image) {
        const imgEl = document.createElement('img');
        imgEl.className = 'responsive';
        imgEl.src = image;
        if (decorative) {
            imgEl.alt = '';
            imgEl.setAttribute('aria-hidden', 'true');
        } else {
            imgEl.alt = imageAlt;
        }
        button.append(imgEl);
    } else if (icon) {
        if (!(icon instanceof HTMLSpanElement)) {
            const msg = `icon is not an <span>-element`;
            console.error(msg, icon);
            debugger;
            throw Error(msg);
        }
        button.append(icon);
    }

    if (label) {
        const span = document.createElement('span');
        span.textContent = label;
        button.append(span);
    }

    if (badge !== undefined) {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'badge';
        badgeEl.textContent = String(badge);
        button.append(badgeEl);
    }

    if (onClick) {
        button.addEventListener('click', onClick);
    }

    return button;
}


/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `msLimit` milliseconds.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} func
 * @param {number} msLimit
 * @returns {(this: ThisParameterType<T>, ...args: Parameters<T>) => void} A new throttled function.
 */
function throttle(func, msLimit) {
    let inThrottle = false;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, msLimit);
        }
    };
}


const rootPixelSize = rootSizeInPixels();
function updateRange(input) {
    // console.log("updateRange here");
    // debugger;
    // onWeak(input, "change", onChangeInput);
    // const divSlider = parent(input);
    const divSlider = input.closest(".slider");
    // const bar = query("span", divSlider);
    const bar = divSlider.querySelector("span");
    // const inputs = queryAll("input", divSlider);
    const inputs = divSlider.querySelectorAll("input", divSlider);
    if (!inputs.length || !bar) return;
    // const thumb = hasClass(divSlider, "max") ? 0 : .25 * rootSize * 100 / inputs[0].offsetWidth;
    const thumbHasMax = divSlider.classList.contains("max");
    // const thumb = divSlider.classList.contains("max") ? 0 : .25 * rootPixelSize * 100 / inputs[0].offsetWidth;
    const i0 = inputs[0];
    // if (!i0.isConnected) { debugger; }
    const thumb = thumbHasMax ?
        0 :
        .25 * rootPixelSize * 100 / i0.offsetWidth;
    const percents = [];
    const values = [];
    for (let i = 0, n = inputs.length; i < n; i++) {
        const min = parseFloat(inputs[i].min) || 0;
        const max = parseFloat(inputs[i].max) || 100;
        const value = parseFloat(inputs[i].value) || 0;
        const percent = (value - min) * 100 / (max - min);
        const fix = thumb / 2 - thumb * percent / 100;
        percents.push(percent + fix);
        values.push(value);
    }
    let percent = percents[0];
    let start = 0;
    let end = 100 - start - percent;
    let value1 = values[0];
    let value2 = values[1] || 0;
    if (inputs.length > 1) {
        percent = Math.abs(percents[1] - percents[0]);
        start = percents[1] > percents[0] ? percents[0] : percents[1];
        end = 100 - start - percent;
        if (value2 > value1) {
            value1 = values[1] || 0;
            value2 = values[0];
        }
    }
    requestAnimationFrame(() => {
        // divSlider.style.cssText = `--_start: ${start}%; --_end: ${end}%; --_value1: '${value1}'; --_value2: '${value2}';`
        divSlider.style.setProperty("--_start", `${start}%`);
        divSlider.style.setProperty("--_end", `${end}%`);
        divSlider.style.setProperty("--_value1", `${value1}`);
        divSlider.style.setProperty("--_value2", `${value2}`);
    }
    );
}
function BADrootSizeInPixels() {
    const root =
        document.querySelector(".beer")
        ?? document.documentElement;

    const value =
        getComputedStyle(root)
            .getPropertyValue("--size")
            .trim();

    return parseFloat(value) || 16;
}
function rootSizeInPixels() {
    const root =
        document.querySelector(".beer")
        ?? document.documentElement;

    // 1. Create a dummy element to let the browser resolve the CSS units
    const dummy = document.createElement("div");

    // 2. Set its width using your custom property
    dummy.style.width = `var(--size, 16px)`;
    dummy.style.position = "absolute";
    dummy.style.visibility = "hidden";

    // 3. Append, measure the absolute pixel width, and clean up
    root.appendChild(dummy);
    const pixelWidth = parseFloat(getComputedStyle(dummy).width);
    root.removeChild(dummy);

    // 4. Return the guaranteed pixel number (or fallback to 16)
    return pixelWidth || 16;
}
