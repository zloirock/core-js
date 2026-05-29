// Promise.resolve aliased to `tag`, then invoked as a tagged template (`tag\`raw\``).
// Unusual but parser-accepted; a tagged template carries no argument list, so return-type
// inference bails to the default Promise<unknown> while Promise.resolve stays polyfilled.
const tag = Promise.resolve;
const r = tag`hello`;
r.then(x => x);
