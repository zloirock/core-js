// `const { at } = globalThis.myArr` keeps the proxy chain as the receiver of `_at(...)`;
// `globalThis` is also polyfilled so the call works on engines lacking it.
const { at } = globalThis.myArr;
at(0);
