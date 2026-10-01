import _at from "@core-js/pure/actual/instance/at";
// heterogeneous for-of object-destructuring: folding every element keeps `value` a string|array
// union rather than narrowing to the leading string. `value.at()` (Array AND String) therefore
// resolves to the GENERIC instance polyfill - NOT the leading element's string-specific
// `_atMaybeString` (which would be unsound for the array element) nor a dropped polyfill. the
// polyfill is kept, just generic, because the union is not narrowed to one element's type.
for (const {
  value
} of [{
  value: "abc"
}, {
  value: [1, 2, 3]
}]) {
  _at(value).call(value, 0);
}