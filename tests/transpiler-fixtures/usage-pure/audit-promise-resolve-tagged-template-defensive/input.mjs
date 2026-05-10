// tagged-template invocation of Promise.resolve as tag function:
// `Promise.resolve\`raw\`` is unusual but parser-accepted; TaggedTemplate has no
// `arguments` slot, so inferPromiseResolveReturnType must defensively bail
const tag = Promise.resolve;
const r = tag`hello`;
r.then(x => x);
