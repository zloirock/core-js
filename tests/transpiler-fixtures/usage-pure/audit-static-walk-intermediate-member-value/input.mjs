// `const wrapper = {a: globalThis.Array}; const {a: {from}} = wrapper` - the intermediate
// ObjectExpression's property value is a MemberExpression (`globalThis.Array`), not a
// nested ObjectExpression. walkStaticReceiverStep used to bail at `current?.type !==
// 'ObjectExpression'` after recursing into the matched prop's value, losing the
// `from` polyfill via this path. extended with a MemberExpression arm that resolves the
// chain to its leaf constructor name via `resolveObjectName` when one walkPath hop
// remains. defensive precision: in practice the parallel detection pipeline catches
// `from` via simpler emission, so this fix doesn't observably narrow on its own; the
// previously-missing walkStaticReceiverStep path is now uniformly available
const wrapper = { a: globalThis.Array };
const { a: { from } } = wrapper;
from([1, 2, 3]);
