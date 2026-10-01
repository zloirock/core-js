// Annex-B block-function hoisting exists only in sloppy code, and only when nothing between the
// function and its var-scope owner lexically rebinds the name. a plain block rebinds nothing, so
// the hoist wins and the name is LOCAL - no polyfill. every other construct here binds the name
// lexically around the block, which blocks the hoist and leaves the reference GLOBAL - so the
// polyfill is required. an identifier catch param is the one exemption: B.3.5 keeps the hoist
{ function Promise() {} }
Promise.withResolvers();
try { null.x; } catch (Set) { { function Set() {} } }
new Set().union(new Set());
for (let Map of []) { function Map() {} }
Map.groupBy([], v => v);
switch (1) { case 1: let Object; { function Object() {} } }
Object.groupBy([], v => v);
try { null.x; } catch ({ Array }) { { function Array() {} } }
Array.fromAsync([]);
for (const Iterator in {}) { function Iterator() {} }
Iterator.from([]);
module.exports = 1;
