import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Mixed literal containers retain their static property reads and native array iteration.
// Only the instance leaves dispatch through their original array or string receiver.
const numbers = {
  methods: Object,
  value: [4, 8]
};
const [,] = [numbers, mark()];
const {
  methods: {
    is
  }
} = numbers;
const at = _atMaybeArray(numbers.value);
const text = {
  value: 'abc',
  methods: Math
};
const [,] = [text, mark()];
const includes = _includesMaybeString(text.value);
const {
  methods: {
    sign
  }
} = text;
export { is, at, includes, sign };