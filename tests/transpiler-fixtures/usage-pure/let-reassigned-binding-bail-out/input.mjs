// a reassigned binding in usage-pure resolves to the ONE value its read can observe: `A = Promise`
// dominates the use unconditionally and nothing writes A after it, so the read is a read off
// Promise - the ponyfill ctor stands in for the alias and the static is read off it raw (no
// `Promise.from` polyfill exists). an ambiguous binding (a conditional write, a write after the
// read) still bails to the runtime ctor guard
let A = Array;
A = Promise;
A.from();
