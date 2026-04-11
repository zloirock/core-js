import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let x;
({
  a: [x]
} = {
  a: ['hello']
});
_atMaybeString(x).call(x, 0);