import "core-js/modules/es.global-this";
// Removing a vestigial optional must not detach the root before its substitution.
export const r = (globalThis?.window).document;