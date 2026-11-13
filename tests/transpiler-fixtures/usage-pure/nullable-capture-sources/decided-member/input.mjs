// A plain member reads through the sealed value of a decided selection.
export const from = (typeof Symbol !== "undefined" ? globalThis.window?.Array : Set).from;
