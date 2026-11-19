// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = (held = other = (effects.push("prefix"), Array)).from?.([1, 2]).at(-1);
