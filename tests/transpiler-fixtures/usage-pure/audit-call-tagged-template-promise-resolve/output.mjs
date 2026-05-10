import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `Promise.resolve` invoked as TAGGED-TEMPLATE: `Promise.resolve\`raw\`` - parser-accepted
// but TaggedTemplateExpression has no `arguments` slot. inferPromiseResolveReturnType has
// a defensive guard checking `callPath.node.type` is CallExpression / OptionalCallExpression;
// without it, `.arguments[0]` access on TT would crash. result: bail to default Promise<unknown>
const r = _Promise$resolve`hello`;
r.then(x => x);