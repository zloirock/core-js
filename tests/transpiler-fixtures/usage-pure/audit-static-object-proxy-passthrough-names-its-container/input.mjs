// a static-object receiver whose descent reaches a proxy (`{ g: globalThis }`) carrying a PASSTHROUGH
// leaf (`other` - a slot the receiver keeps) beside a missing-able ctor (`Set`): the passthrough needs
// a receiver the render can NAME, and a parameter default over a BOUND container is spelled through
// that container's own name, while the ctor injects its pure constructor (`Set` -> `_Set`) and the
// mirror renders. a static-object receiver with no name spells the leaf through the proxy root it
// reaches instead of a null-named member - this fixture guards the regression where the babel
// emitter threw
const w = { g: globalThis };
function read({ g: { Set, other } } = w) {
  return [new Set(), other];
}
function readInline({ g: { Set, other } } = { g: globalThis }) {
  return [new Set(), other];
}
export const out = [read(), readInline()];
