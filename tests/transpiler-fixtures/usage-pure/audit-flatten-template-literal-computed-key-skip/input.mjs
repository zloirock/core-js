// nested-proxy flatten + inner template-literal computed key. without the fix,
// isPolyfillableMemberAccess only recognised StringLiteral / Literal computed-string
// keys; backtick template literal `globalThis[`Map`]` slipped through and the flatten
// walker rewrote the inner `globalThis` Identifier separately, double-emitting. after
// the fix, single-quasi TemplateLiteral with no expressions is recognised as a static
// string key the same way `obj['Map']` is
const { Map } = globalThis;
const inner = globalThis[`Map`];
const m = new Map();
m.set('a', inner);
export { m };
