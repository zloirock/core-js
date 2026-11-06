// A bound or inline literal container remains the source of a parameter default.
// Its native constructor and passthrough reads must not invent an unnamed receiver.
const w = { g: globalThis };
function read({ g: { Set, other } } = w) {
  return [new Set(), other];
}
function readInline({ g: { Set, other } } = { g: globalThis }) {
  return [new Set(), other];
}
export const out = [read(), readInline()];
