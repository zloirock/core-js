// Inner AssignmentPattern in nested proxy-global flatten:
// `{ Array: { from } = {} } = globalThis` - inner ObjectPattern is wrapped in
// AssignmentPattern providing default `{}`. Default never fires for proxy-global
// receivers (`globalThis.Array` always defined), so AssignmentPattern is treated as
// transparent under "polyfill always wins". `peelDestructureWrappers` skips it in the
// classifier; `peelTransparentWrappers` skips it in babel-plugin's flatten walker;
// unplugin's `planOuterProp` peels via `outerProp.value.type === 'AssignmentPattern'`.
// All three layers cooperate to flatten to `const from = _Array$from; const of = _Array$of;`
const { Array: { from } = {} } = globalThis;
const { Array: { of } = {} } = globalThis;
export { from, of };
