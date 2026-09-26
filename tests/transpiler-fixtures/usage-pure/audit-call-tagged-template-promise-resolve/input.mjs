// `Promise.resolve` invoked as a tagged template (`Promise.resolve\`raw\``) - parser-accepted
// but a tagged template carries no argument list. Return-type inference cannot read an
// argument, so it falls back to the default Promise<unknown> while still polyfilling
// Promise.resolve itself.
const r = Promise.resolve`hello`;
r.then(x => x);
