// a for-HEAD holding a consumed declarator beside one whose init has a side effect: only the
// declarators the extraction introduces are registered on the scope. re-registering the whole
// declaration re-registers the sibling an earlier prop already rewrote, and the build aborts
let calls = 0;
function bump() { calls++; return JSON; }
for (const { Array: { from } } = globalThis, { parse } = bump(); flag;) break;
for (const { Set: { of } } = globalThis, { stringify } = bump(), z = 1; flag;) break;
console.log(calls, from, parse, of, stringify, z);
