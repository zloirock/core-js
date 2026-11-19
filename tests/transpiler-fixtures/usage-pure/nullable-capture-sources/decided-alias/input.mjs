// An alias of a decided selection carries its optional value into later reads.
const held = typeof Symbol !== "undefined" ? globalThis.window?.Array : Set;
export const { from } = held;
