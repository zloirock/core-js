import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// tagged-template `tag\`...\`` is a TaggedTemplateExpression, not a CallExpression -
// `inlineCallReturnExpression` only matches CallExpression / OptionalCallExpression.
// guards against accidentally inlining `tag` argument when the tag is itself an arrow
// returning a known global. `(tag => Map)\`x\`.has(1)` tests parser distinction
const tag = () => _Map;
const a = tag`x`.has(1);
const tag2 = () => _Set;
const b = tag2`y`.intersection(new _Set([1]));
export { a, b };