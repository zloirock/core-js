// Multi-level chain-assignment receiver: `(a = b = Array).from([1])`. peelChainAssignment
// returns OUTERMOST assignment node (outer = `a = b = Array`); the nested `b = Array`
// is part of outer's source, so emitting just outer covers all assignments without
// duplication. Result: `(a = b = Array, _Array$from)([1])` - both `a` and `b` get bound,
// then polyfill is called
const r = (a = b = Array).from([1]);
const s = (x = y = Object).entries({ k: 1 });
[r, s];
