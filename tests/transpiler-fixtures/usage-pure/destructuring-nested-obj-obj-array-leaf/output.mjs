import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const {
  a: {
    b: [c]
  }
} = {
  a: {
    b: ['hello']
  }
};
_atMaybeString(c).call(c, 0);