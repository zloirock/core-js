// `walkStaticReceiverChain` hops through `ns -> ObjectExpression -> root -> globalThis`,
// then continues with walkPath = ['Array']. Without the proxy-global mid-chain lift,
// the Identifier `globalThis` causes the descent to bail (Identifier is neither
// ObjectExpression nor an unbound leaf for an EMPTY walkPath). With the fix, the
// proxy-global is recognised at mid-chain and the leaf `Array` resolves as the
// constructor for `from` polyfill emission. Discriminating revert: `from` stays raw
const ns = { root: globalThis };
const { root: { Array: { from } } } = ns;
export const arr = from([1, 2, 3]);
