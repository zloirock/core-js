// An optional reader of a decided selection keeps its undefined result.
export const from = (typeof Symbol !== "undefined" ? globalThis.window?.Array : Set)?.from;
