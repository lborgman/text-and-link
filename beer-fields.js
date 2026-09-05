/**
 * beer-fields.js
 *
 * Utility functions for building Beer CSS form field markup (text input,
 * textarea, switch) without depending on Beer CSS's own JS module.
 *
 * Beer CSS reference: https://github.com/beercss/beercss/blob/main/docs
 */

// ---------------------------------------------------------------------------
// Shared internals
// ---------------------------------------------------------------------------

/**
 * @typedef {object} FieldOptions
 * @property {string} [label] - Floating label text. Omit for no label.
 * @property {string} [value] - Initial value.
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
 * @returns {{ field: HTMLDivElement, input: HTMLInputElement }}
 */
export function createTextField({
    type = 'text',
    value = '',
    name,
    onInput,
    ...rest
} = {}) {
    const { field, label } = buildField(rest, false);

    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    if (name) input.name = name;

    field.append(input);
    if (label) field.append(label);

    wireFloatingLabel(input, label);

    if (onInput) {
        input.addEventListener('input', () => onInput(input.value));
    }

    return { field, input };
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
export function createSwitch({ checked = false, label, name, onChange } = {}) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'switch';
    input.checked = checked;
    if (name) input.name = name;

    let wrapper = input;

    if (label) {
        const id = nextId('switch');
        input.id = id;

        const container = document.createElement('div');
        container.className = 'switch-field';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.textContent = label;

        container.append(input, labelEl);
        wrapper = container;
    }

    if (onChange) {
        input.addEventListener('change', () => onChange(input.checked));
    }

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
 * @param {(value: number) => void} [options.onInput]
 * @returns {{ wrapper: HTMLElement, input: HTMLInputElement }}
 */
export function createSlider({
    min = 0,
    max = 100,
    step = 1,
    value,
    name,
    showBubble = true,
    onInput,
} = {}) {
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value ?? min);
    if (name) input.name = name;

    if (!showBubble) {
        if (onInput) {
            input.addEventListener('input', () => onInput(Number(input.value)));
        }
        return { wrapper: input, input };
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'slider-field';
    wrapper.style.position = 'relative';

    const bubble = document.createElement('span');
    bubble.className = 'slider-bubble';
    bubble.style.position = 'absolute';
    bubble.style.pointerEvents = 'none';
    bubble.style.top = '-1.75rem';

    wrapper.append(input, bubble);

    const updateBubble = () => {
        const percent = (Number(input.value) - min) / (max - min);
        bubble.textContent = input.value;
        // Nudges the bubble to follow the thumb; the 8px fudge roughly accounts
        // for thumb radius so the bubble centers over it rather than the track.
        bubble.style.left = `calc(${percent * 100}% - ${percent * 16 - 8}px)`;
    };

    input.addEventListener('input', () => {
        updateBubble();
        if (onInput) onInput(Number(input.value));
    });
    updateBubble();

    return { wrapper, input };
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------

/**
 * Creates a single Beer CSS chip (`<a class="chip">` or `<button class="chip">`).
 * @param {object} [options]
 * @param {string} [options.label]
 * @param {string} [options.icon] - Material icon name shown before the label.
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
        const iconEl = document.createElement('i');
        iconEl.textContent = icon;
        chip.append(iconEl);
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
 * @param {{ label: string, icon?: string, onSelect?: () => void }[]} options.items
 * @returns {{ menu: HTMLElement, open: () => void, close: () => void }}
 */
export function createMenu({ trigger, items }) {
    const menu = document.createElement('menu');
    menu.style.position = 'absolute';
    menu.style.display = 'none';

    for (const item of items) {
        const row = document.createElement('a');
        row.className = 'row';
        if (item.icon) {
            const iconEl = document.createElement('i');
            iconEl.textContent = item.icon;
            row.append(iconEl);
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

    function position() {
        const rect = trigger.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;
    }

    function onOutsideClick(event) {
        if (!menu.contains(event.target) && event.target !== trigger) close();
    }

    function onKeydown(event) {
        if (event.key === 'Escape') close();
    }

    function open() {
        position();
        menu.style.display = '';
        document.addEventListener('click', onOutsideClick, { capture: true });
        document.addEventListener('keydown', onKeydown);
    }

    function close() {
        menu.style.display = 'none';
        document.removeEventListener('click', onOutsideClick, { capture: true });
        document.removeEventListener('keydown', onKeydown);
    }

    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        if (menu.style.display === 'none') open();
        else close();
    });

    document.body.append(menu);

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