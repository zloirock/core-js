import _Array$of from "@core-js/pure/actual/array/of";
// `delete Object.key` removes the slot; subsequent `Object.key(...)` reads hit the prototype
// chain or undefined, NOT the polyfill import. plugin's pre-pass detects the
// UnaryExpression{operator: 'delete', argument: MemberExpression} mutation shape and bails
// substitution for matching reads. independent `Array.of` polyfill still fires
delete Array.from;
Array.from([1, 2, 3]);
_Array$of(4, 5, 6);