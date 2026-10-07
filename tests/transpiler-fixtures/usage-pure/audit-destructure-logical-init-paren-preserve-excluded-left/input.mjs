// Other sources keep their rest exclusions and independently claimed statics. A `??` over a parenthesized
// `||` keeps both and the parens in the residual the claimed static leaves where no left decides: neither
// `globalThis.Map` (its constructor entry excluded, while `groupBy` keeps its own) nor `globalThis.WeakRef`.
const { groupBy, ...props } = globalThis.Map ?? (globalThis.WeakRef || Set);
export { groupBy, props };
