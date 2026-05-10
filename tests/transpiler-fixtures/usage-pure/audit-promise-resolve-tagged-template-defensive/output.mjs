import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// tagged-template invocation of Promise.resolve as tag function:
// `Promise.resolve\`raw\`` is unusual but parser-accepted; TaggedTemplate has no
// `arguments` slot, so inferPromiseResolveReturnType must defensively bail
const tag = _Promise$resolve;
const r = tag`hello`;
r.then(x => x);