// tagged-template `tag\`...\`` is a TaggedTemplateExpression, not a CallExpression -
// `inlineCallReturnExpression` only matches CallExpression / OptionalCallExpression.
// guards against accidentally inlining `tag` argument when the tag is itself an arrow
// returning a known global. `(tag => Map)\`x\`.has(1)` tests parser distinction
const tag = () => Map;
const a = tag`x`.has(1);
const tag2 = (() => Set);
const b = tag2`y`.intersection(new Set([1]));
export { a, b };
