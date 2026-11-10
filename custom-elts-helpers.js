/**
 * A mixin that defers initialization until the element is truly visible.
 * @param {CustomElementConstructor} BaseClass - The class to extend from (e.g., HTMLElement)
 * @param {string} initMethodName - The name of the method to call when visible
 */
export const withSafeInit = (BaseClass = HTMLElement, initMethodName = 'onVisibleInit') => {
    return class extends BaseClass {
        connectedCallback() {
            // Always call super if the base class defines a connectedCallback
            if (super.connectedCallback) {
                super.connectedCallback();
            }

            // 1. Yield to the browser to calculate layout and styles
            requestAnimationFrame(() => {
                const isReadyForInit = this.checkVisibility({
                    opacityProperty: true,
                    visibilityProperty: true,
                    contentVisibilityProperty: true
                });

                if (!isReadyForInit) {
                    this.#waitForVisibility();
                    return;
                }

                this.#triggerInit();
            });
        }

        #triggerInit() {
            // 2. Dynamically call the generalized initialization function
            if (typeof this[initMethodName] === 'function') {
                this[initMethodName]();
            } else {
                console.warn(`SafeInit: Expected method "${initMethodName}" to be defined on`, this);
            }
        }

        #waitForVisibility() {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    this.#triggerInit();
                    observer.disconnect();
                }
            });
            observer.observe(this);
        }
    };
};
