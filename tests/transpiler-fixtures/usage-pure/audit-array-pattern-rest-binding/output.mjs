// rest in ArrayPattern: walkPatternIdentifiers must visit the rest target as a binding.
// require shadowing test: if `require` is bound via array-rest, its calls aren't real
// core-js entries. declaresRequireBinding uses walkPatternIdentifiers
const [first, ...require] = list;
const x = require('core-js/array');
first;
x;