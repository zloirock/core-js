// a for-HEAD holding a consumed declarator beside a side-effecting sibling init: the head is not
// rewritten under this method, so what is locked here is that neither declarator loses its module
let calls = 0;
function bump() { calls++; return JSON; }
for (const { Array: { from } } = globalThis, { parse } = bump(); flag;) break;
for (const { Object: { entries } } = globalThis, { stringify } = bump(), z = 1; flag;) break;
console.log(calls, from, parse, entries, stringify, z);
