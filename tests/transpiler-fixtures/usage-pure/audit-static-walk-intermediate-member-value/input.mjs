// `const wrapper = {a: globalThis.Array}; const {a: {from}} = wrapper` - the intermediate
// ObjectExpression property value is a MemberExpression (`globalThis.Array`), not a nested
// ObjectExpression. the receiver-step walk used to bail on non-ObjectExpression; it now
// resolves a member chain to its leaf. a parallel path emits `from` anyway, so output is unchanged.
const wrapper = { a: globalThis.Array };
const { a: { from } } = wrapper;
from([1, 2, 3]);
