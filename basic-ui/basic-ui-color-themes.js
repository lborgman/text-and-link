/*
    Color themes can not be implemented as ES6 modules since they
    must be applied before JavaScript modules are loaded.

    This implementation instead defines a global object:
        globalThis.BasicUI_ColorThemes

    Nothing else is added to globalThis!
*/
(function () {
    // Define your public methods
    const publicAPI = {
        /**
         * Generates a full Material Design 3 color palette with variant support.
         *  @param {string} baseInput - Seed color hex code or standard CSS color name.
         *  @param {boolean} [isDark=false] - Optional flag to generate dark mode tokens.
         *  @param {'tonalSpot'|'vibrant'|'expressive'|'fidelity'|'content'|'fruitSalad'|'rainbow'|'monochrome'} [variant='tonalSpot'] - M3 Scheme Variant.
         *  @returns {Record<string, string>} Object containing CSS custom properties.
         *  @throws {TypeError}
         */
        generateTheme: function (baseInput, isDark, variant) {
            return generateMaterial3ThemePalette(baseInput, isDark, variant);
        },

        /**
         *  @param {Record<string, string>} colorTheme - containing CSS custom properties.
         *  @param {HTMLElement} [targetElement]
         */
        applyTheme: function (colorTheme, targetElement = document.documentElement) {
            // console.log("Applying color theme:", colorTheme);
            Object.entries(colorTheme).forEach(([prop, value]) => {
                targetElement.style.setProperty(prop, value);
            });
        }
    };

    // Freeze the object to prevent any modifications, additions, or deletions
    Object.freeze(publicAPI);

    // Attach it to the global scope
    globalThis.BasicUI_ColorThemes = publicAPI;

    /**
   * Generates a minimal Material Design color palette.
   * @param {string} baseInput - Seed color hex code or standard CSS color name.
   * @param {boolean} [isDark=false] - Optional flag to generate dark mode tokens.
   * @returns {Record<string, string>} Object containing CSS custom properties.
   * @throws {TypeError}
   */
    function generateMaterial2ThemePalette(baseInput, isDark = false) {
        // Convert color name or raw hex string to normalized 6-digit hex
        let hex = baseInput.startsWith("#") ? baseInput : colorNameToHex(baseInput);
        if (!hex) {
            throw TypeError(`Invalid color format or name: "${baseInput}"`);
        }

        hex = hex.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split("").map((c) => c + c).join("");
        }

        // Convert Hex to HSL
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        const hDeg = Math.round(h * 360);
        const sPct = Math.round(s * 100);

        // Helper: HSL to Hex
        const hslToHex = (h, s, l) => {
            l = Math.min(100, Math.max(0, l)) / 100;
            s = Math.min(100, Math.max(0, s)) / 100;
            const a = s * Math.min(l, 1 - l);
            const f = (n) => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, "0");
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };

        // Branch token calculations for Light vs Dark mode
        if (isDark) {
            return {
                "--primary": hslToHex(hDeg, Math.min(sPct + 10, 100), 75),
                "--primary-container": hslToHex(hDeg, sPct, 25),

                "--secondary": hslToHex((hDeg - 15 + 360) % 360, Math.max(sPct - 10, 10), 70),
                "--secondary-container": hslToHex((hDeg - 15 + 360) % 360, Math.max(sPct - 10, 10), 28),

                "--tertiary": hslToHex((hDeg + 170) % 360, Math.min(sPct + 10, 90), 68),
                "--tertiary-container": hslToHex((hDeg + 170) % 360, Math.min(sPct + 10, 90), 22),

                "--surface": hslToHex(hDeg, 10, 8),
                "--surface-variant": hslToHex(hDeg, 12, 19),

                "--on-surface": hslToHex(hDeg, 10, 90),
                "--on-surface-variant": hslToHex(hDeg, 12, 72),

                "--outline": hslToHex(hDeg, 8, 48),
                "--outline-variant": hslToHex(hDeg, 10, 24),

                "--inverse-surface": hslToHex(hDeg, 10, 92),
                "--inverse-primary": hslToHex(hDeg, sPct, 45),

                "--error": "#f87171",
                "--error-container": "#7f1d1d",

                // Dark Mode Backdrop
                "--backdrop": `hsl(${hDeg}deg 20% 5% / 72%)`,

                "--link-color": "hsl(212deg 100% 75%)",
                "--link-hover": "hsl(212deg 100% 85%)"
            };
        }

        // Light Mode (Default)
        return {
            "--primary": `#${hex}`,
            "--primary-container": hslToHex(hDeg, sPct, 92),

            "--secondary": hslToHex((hDeg - 15 + 360) % 360, Math.max(sPct - 10, 10), 44),
            "--secondary-container": hslToHex((hDeg - 15 + 360) % 360, Math.max(sPct - 10, 10), 94),

            "--tertiary": hslToHex((hDeg + 170) % 360, Math.min(sPct + 10, 90), 32),
            "--tertiary-container": hslToHex((hDeg + 170) % 360, Math.min(sPct + 10, 90), 90),

            "--surface": hslToHex(hDeg, 10, 98),
            "--surface-variant": hslToHex(hDeg, 12, 89),

            "--on-surface": hslToHex(hDeg, 10, 10),
            "--on-surface-variant": hslToHex(hDeg, 12, 32),

            "--outline": hslToHex(hDeg, 8, 64),
            "--outline-variant": hslToHex(hDeg, 12, 90),

            "--inverse-surface": hslToHex(hDeg, 10, 18),
            "--inverse-primary": hslToHex(hDeg, 90, 70),

            "--error": "#dc2626",
            "--error-container": "#fee2e2",

            // Light Mode Backdrop
            "--backdrop": `hsl(${hDeg}deg 20% 10% / 32%)`,

            "--link-color": "hsl(212deg 100% 36%)",
            "--link-hover": "hsl(212deg 100% 25%)"
        };
    }

    /**
     * Applies the generated palette directly to an element.
     * @param {string} baseColor - Color hex or name (e.g. "#4f46e5" or "indigo")
     * @param {boolean} [isDark=false] - Set to true for dark mode tokens
     * @param {HTMLElement} [targetElement=document.documentElement] - Optional target container element
     * @category Visual helpers
     */
    function applyMaterialTheme(baseColor, isDark = false, targetElement = document.documentElement) {
        const palette = generateMaterialThemePalette(baseColor, isDark);
        Object.entries(palette).forEach(([prop, value]) => {
            targetElement.style.setProperty(prop, value);
        });
    }




    /**
     * Generates a full Material Design 3 color palette with variant support.
     *
     * @param {string} baseInput - Seed color hex code or standard CSS color name.
     * @param {boolean} [isDark=false] - Optional flag to generate dark mode tokens.
     * @param {'tonalSpot'|'vibrant'|'expressive'|'fidelity'|'content'|'fruitSalad'|'rainbow'|'monochrome'} [variant='tonalSpot'] - M3 Scheme Variant.
     * @returns {Record<string, string>} Object containing CSS custom properties.
     * @throws {TypeError}
     */
    function generateMaterial3ThemePalette(baseInput, isDark = false, variant = 'tonalSpot') {
        // Convert color name or raw hex string to normalized 6-digit hex
        let hex = baseInput.startsWith("#") ? baseInput : colorNameToHex(baseInput);
        if (!hex) {
            throw TypeError(`Invalid color format or name: "${baseInput}"`);
        }

        hex = hex.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split("").map((c) => c + c).join("");
        }

        // Convert Hex to HSL
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        const hDeg = Math.round(h * 360);
        const sPct = Math.round(s * 100);

        // Helper: HSL to Hex
        const hslToHex = (h, s, l) => {
            h = (h % 360 + 360) % 360; // Normalize hue loop
            l = Math.min(100, Math.max(0, l)) / 100;
            s = Math.min(100, Math.max(0, s)) / 100;
            const a = s * Math.min(l, 1 - l);
            const f = (n) => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, "0");
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };

        // Calculate Scheme Variant Offsets & Saturation Modifiers
        let pSat = sPct;
        let sSat = Math.max(sPct - 15, 10);
        let tSat = Math.min(sPct + 10, 90);

        let secHueShift = -15;
        let tertHueShift = 170;

        switch (variant) {
            case 'vibrant':
                pSat = Math.min(sPct + 35, 100);
                sSat = Math.min(sPct + 20, 90);
                tSat = Math.min(sPct + 25, 95);
                secHueShift = 15;
                tertHueShift = 120;
                break;

            case 'expressive':
                pSat = Math.min(sPct + 20, 95);
                sSat = Math.min(sPct + 15, 85);
                secHueShift = 120; // Compliment hue shift
                tertHueShift = 240;
                break;

            case 'fidelity':
            case 'content':
                pSat = sPct;
                secHueShift = 0;
                tertHueShift = 45;
                break;

            case 'fruitSalad':
                secHueShift = -60;
                tertHueShift = 180;
                pSat = Math.min(sPct + 15, 90);
                break;

            case 'rainbow':
                secHueShift = 30;
                tertHueShift = 210;
                break;

            case 'neutral':
                pSat = Math.min(sPct, 15);
                sSat = 5;
                tSat = 10;
                secHueShift = 0;
                tertHueShift = 0;
                break;

            case 'monochrome':
                pSat = 0;
                sSat = 0;
                tSat = 0;
                secHueShift = 0;
                tertHueShift = 0;
                break;

            case 'tonalSpot':
            default:
                // Standard M3 defaults
                break;
        }

        const secHue = hDeg + secHueShift;
        const tertHue = hDeg + tertHueShift;

        // Dark Mode Palette
        if (isDark) {
            return {
                "--primary": hslToHex(hDeg, pSat, 80),
                "--on-primary": hslToHex(hDeg, pSat, 20),
                "--primary-container": hslToHex(hDeg, pSat, 30),
                "--on-primary-container": hslToHex(hDeg, pSat, 90),

                "--secondary": hslToHex(secHue, sSat, 75),
                "--on-secondary": hslToHex(secHue, sSat, 20),
                "--secondary-container": hslToHex(secHue, sSat, 30),
                "--on-secondary-container": hslToHex(secHue, sSat, 90),

                "--tertiary": hslToHex(tertHue, tSat, 75),
                "--on-tertiary": hslToHex(tertHue, tSat, 20),
                "--tertiary-container": hslToHex(tertHue, tSat, 30),
                "--on-tertiary-container": hslToHex(tertHue, tSat, 90),

                "--surface": hslToHex(hDeg, 10, 6),
                "--surface-dim": hslToHex(hDeg, 10, 6),
                "--surface-bright": hslToHex(hDeg, 10, 24),
                "--surface-container-lowest": hslToHex(hDeg, 10, 4),
                "--surface-container-low": hslToHex(hDeg, 10, 10),
                "--surface-container": hslToHex(hDeg, 10, 12),
                "--surface-container-high": hslToHex(hDeg, 10, 17),
                "--surface-container-highest": hslToHex(hDeg, 10, 22),
                "--surface-variant": hslToHex(hDeg, 12, 19),

                "--on-surface": hslToHex(hDeg, 10, 90),
                "--on-surface-variant": hslToHex(hDeg, 12, 72),

                "--outline": hslToHex(hDeg, 8, 55),
                "--outline-variant": hslToHex(hDeg, 10, 28),

                "--inverse-surface": hslToHex(hDeg, 10, 90),
                "--on-inverse-surface": hslToHex(hDeg, 10, 12),
                "--inverse-primary": hslToHex(hDeg, pSat, 40),

                "--error": "#ffb4ab",
                "--on-error": "#690005",
                "--error-container": "#93000a",
                "--on-error-container": "#ffdad6",

                "--backdrop": `hsl(${hDeg}deg 20% 5% / 72%)`,
                "--link-color": "hsl(212deg 100% 75%)",
                "--link-hover": "hsl(212deg 100% 85%)"
            };
        }

        // Light Mode Palette
        return {
            "--primary": hslToHex(hDeg, pSat, 40),
            "--on-primary": "#ffffff",
            "--primary-container": hslToHex(hDeg, pSat, 90),
            "--on-primary-container": hslToHex(hDeg, pSat, 10),

            "--secondary": hslToHex(secHue, sSat, 40),
            "--on-secondary": "#ffffff",
            "--secondary-container": hslToHex(secHue, sSat, 90),
            "--on-secondary-container": hslToHex(secHue, sSat, 10),

            "--tertiary": hslToHex(tertHue, tSat, 40),
            "--on-tertiary": "#ffffff",
            "--tertiary-container": hslToHex(tertHue, tSat, 90),
            "--on-tertiary-container": hslToHex(tertHue, tSat, 10),

            "--surface": hslToHex(hDeg, 10, 98),
            "--surface-dim": hslToHex(hDeg, 10, 87),
            "--surface-bright": hslToHex(hDeg, 10, 98),
            "--surface-container-lowest": "#ffffff",
            "--surface-container-low": hslToHex(hDeg, 10, 96),
            "--surface-container": hslToHex(hDeg, 10, 94),
            "--surface-container-high": hslToHex(hDeg, 10, 92),
            "--surface-container-highest": hslToHex(hDeg, 10, 90),
            "--surface-variant": hslToHex(hDeg, 12, 89),

            "--on-surface": hslToHex(hDeg, 10, 10),
            "--on-surface-variant": hslToHex(hDeg, 12, 32),

            "--outline": hslToHex(hDeg, 8, 50),
            "--outline-variant": hslToHex(hDeg, 12, 80),

            "--inverse-surface": hslToHex(hDeg, 10, 18),
            "--on-inverse-surface": hslToHex(hDeg, 10, 95),
            "--inverse-primary": hslToHex(hDeg, 90, 80),

            "--error": "#ba1a1a",
            "--on-error": "#ffffff",
            "--error-container": "#ffdad6",
            "--on-error-container": "#410002",

            "--backdrop": `hsl(${hDeg}deg 20% 10% / 32%)`,
            "--link-color": "hsl(212deg 100% 36%)",
            "--link-hover": "hsl(212deg 100% 25%)"
        };
    }

    /**
     * Converts any valid CSS color string (name, rgb, hsl) to a hex string.
     * @param {string} colorName - e.g., "orange", "deepskyblue", "papayawhip"
     * @returns {string|null} Hex color string (e.g., "#f97316") or null if invalid
     * @category Helpers
     */
    function colorNameToHex(colorName) {
        // Create an in-memory 1x1 canvas context
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) return null;

        // ctx.fillStyle = colorName;
        // const computed = ctx.fillStyle;



        // 1. Set to a baseline color
        ctx.fillStyle = "#000000";
        ctx.fillStyle = colorName;

        // If assigning colorName failed and it didn't compute to black, it's invalid
        const computedFirst = ctx.fillStyle;

        // 2. Double-check against a second baseline to verify actual black input vs fallback
        ctx.fillStyle = "#ffffff";
        ctx.fillStyle = colorName;
        const computedSecond = ctx.fillStyle;

        // If the fillStyle didn't change with colorName, the input string is invalid
        if (computedFirst !== computedSecond) {
            return null;
        }

        const computed = computedFirst;




        // Browser resolves valid colors to hex "#rrggbb" or "rgba(...)"
        if (computed.startsWith("#")) {
            return computed;
        }

        // Handle rgb(r, g, b) return values from canvas
        const rgbMatch = computed.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
            const [r, g, b] = rgbMatch.map(Number);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }

        return null;
    }

})();
