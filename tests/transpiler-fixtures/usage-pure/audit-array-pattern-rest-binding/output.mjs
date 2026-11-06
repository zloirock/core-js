// rest in ArrayPattern: pattern-identifier traversal must visit the rest target as a binding.
// require shadowing test: if `require` is bound via array-rest, its calls aren't real
// core-js entries. The require-binding detection relies on that pattern-identifier traversal
const [first, ...require] = list;
const x = require('core-js/array');
first;
x;