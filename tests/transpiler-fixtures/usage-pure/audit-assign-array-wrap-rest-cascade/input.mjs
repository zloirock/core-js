// ASSIGNMENT-form ArrayPattern wrap + rest sibling flows through the rest-aware cascade on
// both plugins: babel renames the consumed key in place, unplugin splices the rebuilt object
// pattern back into the original LHS text - the wrap survives and rest keeps reading the
// matching init element. a multi-element assignment wrapper stays the conservative native
// bail (the single-element peel pair does not descend it)
let from, rest, other;
[{ from, ...rest }] = [Array];
from([1]);
rest;
[{ of: from, ...rest }, other] = [Array, 1];
from(2);
