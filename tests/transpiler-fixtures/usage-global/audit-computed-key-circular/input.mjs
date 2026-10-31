// cyclic alias chain `const a = b; const b = a` used as a computed key must terminate
// without infinite recursion; the dispatch falls back to no-rewrite.
const a = b;
const b = a;
const obj = { [a]: 'hello' };
obj[a].at(0);
