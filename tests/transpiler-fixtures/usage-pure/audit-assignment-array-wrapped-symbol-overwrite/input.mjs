// a `[Symbol.iterator]`-keyed target in a destructuring ASSIGNMENT under an ArrayPattern
// wrapper has no declaration to host an extraction - the destructure assigns natively
// first, then a post-statement overwrite rebinds the target through the iterator-method
// helper so the polyfill wins
let it, r;
[{ [Symbol.iterator]: it, ...r }] = [arr];
it;
r;
