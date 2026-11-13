// An alias of a decided selection carries its optional value into later reads.
// Global preserves the source; this row guards the injection surface.
const held = typeof Symbol !== "undefined" ? globalThis.window?.Array : Set;
export const { from } = held;
