// two independent hop anchors sharing one declaration: each slot re-anchors to its own
// constructor binding and the declaration splits statement-per-declarator
const { Map: { customA } } = globalThis, { Promise: { customB } } = globalThis;
console.log(customA, customB);
