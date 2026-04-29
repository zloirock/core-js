import "core-js/modules/es.string.at";
// shadow-binding violation in straight-line same-scope code: shadowed references
// after the redeclaration point pick up the local binding.
let x = [1, 2, 3];
x = 'hello';
x.at(0);