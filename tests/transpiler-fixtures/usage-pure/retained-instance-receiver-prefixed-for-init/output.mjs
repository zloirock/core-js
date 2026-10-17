import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A prefixed loop initializer keeps the instance receiver in its own declarator.
// Its prefix runs once before the nested read and before the following declarator.
let prefixes = 0;
const host = {
  m: [1, [2]]
};
for (var {
    m: _ref
  } = (prefixes++, host), at = _atMaybeArray(_ref), i = 0; i < 1; i++) console.log(at, prefixes);