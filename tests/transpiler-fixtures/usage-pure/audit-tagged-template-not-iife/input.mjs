// Tagged-template `tag\`whatever\`` with the tag being a function expression
// destructuring its parameter. Tagged templates aren't IIFEs (callee is the
// FunctionExpression but the call protocol is different). `findIifeCallSite` only
// accepts CallExpression / NewExpression / OptionalCallExpression, so synth-swap bails
const result = (function ({ from }) { return from([1]); })`tag`;
export { result };
