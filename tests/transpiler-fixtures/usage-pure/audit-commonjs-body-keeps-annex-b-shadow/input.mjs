// The body alone says CommonJS - no declared source type, no CommonJS extension - so the format
// owner reads a script, the block-scoped `function Map` really hoists, and the ponyfill must not
// go over it. The verdict has to be stored before the first walk consults the strictness model,
// which memoises its answer per node and never asks again.
{ function Map() {} }
Object.assign = shim;
module.exports = new Map();
