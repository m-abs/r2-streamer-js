import { ipcRenderer } from "electron";
import {
    R2_EVENT_READIUMCSS,
} from "../../common/events";

const win = (global as any).window as Window;

const urlRootReadiumCSS = win.location.origin + "/readium-css/iOS/";
// const urlResizeSensor = win.location.origin + "/resize-sensor.js";

export const DEBUG_VISUALS = false;

export const injectSelectionAndFocusCSS = () => {
    appendCSSInline("selectionAndFocus", `
    ::selection {
    background-color: rgb(155, 179, 240) !important;
    color: black !important;
    }
    *:focus {
    outline-style: solid !important;
    outline-width: 2px !important;
    outline-color: blue !important;
    outline-offset: 0px !important;
    }
    *.no-focus-outline:focus {
    outline-style: none !important;
    }`);
};

export const injectReadPosCSS = () => {

    if (!DEBUG_VISUALS) {
        return;
    }

    ensureHead();

    const styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-ReadPos");
    styleElement.setAttribute("type", "text/css");
    const css = `
    :root[style*="readium-sepia-on"] .readium2-read-pos,
    :root[style*="readium-night-on"] .readium2-read-pos,
    .readium2-read-pos {
        color: red !important;
        background-color: silver !important;
    }
    :root[style*="readium-sepia-on"] .readium2-read-pos2,
    :root[style*="readium-night-on"] .readium2-read-pos2,
    .readium2-read-pos2 {
        color: blue !important;
        background-color: yellow !important;
    }
    `;
    styleElement.appendChild(win.document.createTextNode(css));
    win.document.head.appendChild(styleElement);
};

const ensureHead = () => {
    const docElement = win.document.documentElement;

    if (!win.document.head) {
        const headElement = win.document.createElement("head");
        if (win.document.body) {
            docElement.insertBefore(headElement, win.document.body);
        } else {
            docElement.appendChild(headElement);
        }
    }
};

ipcRenderer.on(R2_EVENT_READIUMCSS, (_event: any, messageString: any) => {
    const messageJson = JSON.parse(messageString);
    readiumCSS(messageJson);
});

export const readiumCSS = (messageJson: any) => {

    const docElement = win.document.documentElement;

    if (typeof messageJson.injectCSS !== "undefined") {
        ensureHead();

        const remove = (typeof messageJson.injectCSS === "string" && messageJson.injectCSS.indexOf("rollback") >= 0)
            || !messageJson.injectCSS;
        if (remove) {
            docElement.removeAttribute("data-readiumcss");
            removeAllCSS();
            removeAllCSSInline();
        } else if (!docElement.hasAttribute("data-readiumcss")) {
            docElement.setAttribute("data-readiumcss", "yes");

            let needsDefaultCSS = true;
            if (win.document.head && win.document.head.childElementCount) {
                let elem = win.document.head.firstElementChild;
                while (elem) {
                    if ((elem.localName && elem.localName.toLowerCase() === "style") ||
                        (elem.getAttribute &&
                            (elem.getAttribute("rel") === "stylesheet" ||
                                elem.getAttribute("type") === "text/css" ||
                                (elem.getAttribute("src") &&
                                    (elem.getAttribute("src") as string).endsWith(".css"))))) {
                        needsDefaultCSS = false;
                        break;
                    }
                    elem = elem.nextElementSibling;
                }
            }
            if (needsDefaultCSS && win.document.body) {
                const styleAttr = win.document.body.querySelector("*[style]");
                if (styleAttr) {
                    needsDefaultCSS = false;
                }
            }

            // appendCSS("base");
            // appendCSS("html5patch");
            // appendCSS("safeguards");
            // appendCSS("default");
            // appendCSS("highlights");
            // if (messageJson.injectCSS.indexOf("scroll") >= 0) {
            //     appendCSS("scroll");
            // } else {
            //     appendCSS("pagination");
            // }
            // if (messageJson.injectCSS.indexOf("night_mode") >= 0) {
            //     appendCSS("night_mode");
            // } else if (messageJson.injectCSS.indexOf("sepia_mode") >= 0) {
            //     appendCSS("pagination");
            // }
            // appendCSS("os_a11y");
            // appendCSS("user_settings");
            // if (messageJson.injectCSS.indexOf("fs_normalize") >= 0) {
            //     appendCSS("fs_normalize");
            // }

            appendCSS("before");
            if (needsDefaultCSS) {
                appendCSS("default");
            }
            appendCSS("after");

            appendCSSInline("scrollbarsAndSelection", `
    ::-webkit-scrollbar-button {
    height: 0px !important;
    width: 0px !important;
    }

    ::-webkit-scrollbar-corner {
    background: transparent !important;
    }

    /*::-webkit-scrollbar-track-piece {
    background-color: red;
    } */

    ::-webkit-scrollbar {
    width:  14px;
    height: 14px;
    }

    ::-webkit-scrollbar-thumb {
    background: #727272;
    background-clip: padding-box !important;
    border: 3px solid transparent !important;
    border-radius: 30px;
    }

    ::-webkit-scrollbar-thumb:hover {
    background: #4d4d4d;
    }

    ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 3px rgba(40, 40, 40, 0.2);
    background: #dddddd;
    box-sizing: content-box;
    }

    ::-webkit-scrollbar-track:horizontal {
    border-top: 1px solid silver;
    }
    ::-webkit-scrollbar-track:vertical {
    border-left: 1px solid silver;
    }

    .mdc-theme--dark ::-webkit-scrollbar-thumb {
    background: #a4a4a4;
    border: 3px solid #545454;
    }

    .mdc-theme--dark ::-webkit-scrollbar-thumb:hover {
    background: #dedede;
    }

    .mdc-theme--dark ::-webkit-scrollbar-track {
    background: #545454;
    }

    .mdc-theme--dark ::-webkit-scrollbar-track:horizontal {
    border-top: 1px solid black;
    }
    .mdc-theme--dark ::-webkit-scrollbar-track:vertical {
    border-left: 1px solid black;
    }

    ::selection {
    background-color: rgb(155, 179, 240) !important;
    color: black !important;
    }

    .mdc-theme--dark ::selection {
    background-color: rgb(100, 122, 177) !important;
    color: white !important;
    }
    *:focus {
    outline-style: solid !important;
    outline-width: 2px !important;
    outline-color: blue !important;
    outline-offset: 0px !important;
    }
    *.no-focus-outline:focus {
    outline-style: none !important;
    }
        `);
        }
    }

    // tslint:disable-next-line:max-line-length
    // https://github.com/readium/readium-css/tree/develop/prototype/iOS-implem#manage-user-settings
    // tslint:disable-next-line:max-line-length
    // https://github.com/readium/readium-css/blob/develop/prototype/iOS-implem/Specific-docs/CSS12-api.md#user-settings
    // tslint:disable-next-line:max-line-length
    // https://github.com/readium/readium-css/blob/develop/prototype/iOS-implem/Specific-docs/CSS09-user_prefs.md#switches
    if (typeof messageJson.setCSS !== "undefined") {

        const remove = (typeof messageJson.setCSS === "string" && messageJson.setCSS.indexOf("rollback") >= 0)
            || !messageJson.setCSS;
        if (remove) {

            docElement.style.overflow = "auto";

            const toRemove: string[] = [];
            for (let i = 0; i < docElement.style.length; i++) {
                const item = docElement.style.item(i);
                if (item.indexOf("--USER__") === 0) {
                    toRemove.push(item);
                }
            }
            toRemove.forEach((item) => {
                docElement.style.removeProperty(item);
            });
        } else {
            let dark = false;
            let night = false;
            let sepia = false;
            let invert = false;
            let paged = false;
            let font: string | undefined;
            let align: string | undefined;
            if (typeof messageJson.setCSS === "object") {
                if (messageJson.setCSS.dark) {
                    dark = true;
                }
                if (messageJson.setCSS.night) {
                    night = true;
                }
                if (messageJson.setCSS.sepia) {
                    sepia = true;
                }
                if (messageJson.setCSS.invert) {
                    invert = true;
                }
                if (messageJson.setCSS.paged) {
                    paged = true;
                }
                if (typeof messageJson.setCSS.font === "string") {
                    font = messageJson.setCSS.font;
                }
                if (typeof messageJson.setCSS.align === "string") {
                    align = messageJson.setCSS.align;
                }
            }

            if (night) {
                // win.document.body
                docElement.classList.add("mdc-theme--dark");
            } else {
                // win.document.body
                docElement.classList.remove("mdc-theme--dark");
            }

            const needsAdvanced = true; // dark || invert;

            // readium-advanced-on | readium-advanced-off
            docElement.style.setProperty("--USER__advancedSettings",
                needsAdvanced ? "readium-advanced-on" : "readium-advanced-off");

            // readium-darken-on | readium-darken-off
            docElement.style.setProperty("--USER__darkenFilter",
                dark ? "readium-darken-on" : "readium-darken-off");

            // readium-invert-on | readium-invert-off
            docElement.style.setProperty("--USER__invertFilter",
                invert ? "readium-invert-on" : "readium-invert-off");

            // readium-default-on | readium-sepia-on | readium-night-on
            docElement.style.setProperty("--USER__appearance",
                sepia ? "readium-sepia-on" : (night ? "readium-night-on" : "readium-default-on"));

            // readium-paged-on | readium-scroll-on
            docElement.style.setProperty("--USER__view",
                paged ? "readium-paged-on" : "readium-scroll-on");
            if (paged) {
                docElement.style.overflow = "hidden";
            }

            const needsFontOverride = typeof font !== "undefined" && font !== "DEFAULT";
            // readium-font-on | readium-font-off
            docElement.style.setProperty("--USER__fontOverride",
                needsFontOverride ? "readium-font-on" : "readium-font-off");

            // var(--RS__oldStyleTf) | var(--RS__modernTf) | var(--RS__sansTf) | var(--RS__humanistTf) | AccessibleDfa
            docElement.style.setProperty("--USER__fontFamily",
                !needsFontOverride ? "" :
                    (font === "DYS" ? "AccessibleDfa" :
                        (font === "OLD" ? "var(--RS__oldStyleTf)" :
                            (font === "MODERN" ? "var(--RS__modernTf)" :
                                (font === "SANS" ? "var(--RS__sansTf)" :
                                    (font === "HUMAN" ? "var(--RS__humanistTf)" :
                                        (font === "MONO" ? "var(--RS__monospaceTf)" :
                                            (font ? font : "var(--RS__oldStyleTf)")
                                        )
                                    )
                                )
                            )
                        )
                    ));

            // left (LTR) or right (RTL) | justify
            docElement.style.setProperty("--USER__textAlign",
                align === "justify" ? "justify" :
                    (align === "right" ? "right" :
                        (align === "left" ? "left" : "left")
                    ));

            // // auto | none
            // docElement.style.setProperty("--USER__bodyHyphens", "auto");

            // // 1 | 2 | auto
            // docElement.style.setProperty("--USER__colCount", "2");

            // // 75% | 87.5% | 100% | 112.5% | 137.5% | 150% | 162.5% | 175% | 200% | 225% | 250%
            // docElement.style.setProperty("--USER__fontSize", "112.5%");

            // // 1 | 1.067 | 1.125 | 1.2 (suggested default) | 1.25 | 1.333 | 1.414 | 1.5 | 1.618
            // docElement.style.setProperty("--USER__typeScale", "1.2");

            // // 1 | 1.125 | 1.25 | 1.35 | 1.5 | 1.65 | 1.75 | 2
            // docElement.style.setProperty("--USER__lineHeight", "2");

            // // 0 | 0.375rem | 0.75rem | 1rem | 1.125rem | 1.25rem | 1.35rem | 1.5rem | 1.65rem | 1.75rem | 2rem
            // docElement.style.setProperty("--USER__paraSpacing", "1rem");

            // // 0 | 0.5rem | 1rem | 1.25rem | 1.5rem | 2rem | 2.5rem | 3rem
            // docElement.style.setProperty("--USER__paraIndent", "1rem");

            // // 0.125rem | 0.25rem | 0.375rem | 0.5rem
            // docElement.style.setProperty("--USER__wordSpacing", "0.5rem");

            // // 0.0675rem | 0.125rem | 0.1875rem | 0.25rem
            // docElement.style.setProperty("--USER__letterSpacing", "0.1875rem");

            // // 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2
            // docElement.style.setProperty("--USER__pageMargins", "1.25");

            // docElement.style.setProperty("--USER__backgroundColor", "#FFFFFF");
            // docElement.style.setProperty("--USER__textColor", "#000000");
        }
    }
};

function appendCSSInline(id: string, css: string) {
    const styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-" + id);
    styleElement.setAttribute("type", "text/css");
    styleElement.appendChild(document.createTextNode(css));
    win.document.head.appendChild(styleElement);
}

function removeCSSInline(id: string) {
    const styleElement = win.document.getElementById("Readium2-" + id);
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}

function removeAllCSSInline() {
    removeCSSInline("scrollbarsAndSelection");
}

function appendCSS(mod: string) {
    const linkElement = win.document.createElement("link");
    linkElement.setAttribute("id", "ReadiumCSS-" + mod);
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", urlRootReadiumCSS + "ReadiumCSS-" + mod + ".css");
    if (mod === "before" && win.document.head.childElementCount) {
        win.document.head.insertBefore(linkElement, win.document.head.firstElementChild);
    } else {
        win.document.head.appendChild(linkElement);
    }
}

function removeCSS(mod: string) {
    const linkElement = win.document.getElementById("ReadiumCSS-" + mod);
    if (linkElement && linkElement.parentNode) {
        linkElement.parentNode.removeChild(linkElement);
    }
}

function removeAllCSS() {
    removeCSS("before");
    removeCSS("after");
    removeCSS("base");
    removeCSS("html5patch");
    removeCSS("safeguards");
    removeCSS("default");
    removeCSS("highlights");
    removeCSS("scroll");
    removeCSS("pagination");
    removeCSS("night_mode");
    removeCSS("pagination");
    removeCSS("os_a11y");
    removeCSS("user_settings");
    removeCSS("fs_normalize");
}
