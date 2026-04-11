import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const {
  a: [,, c]
} = {
  a: [1, 2, 'hello']
};
_atMaybeString(c).call(c, 0);