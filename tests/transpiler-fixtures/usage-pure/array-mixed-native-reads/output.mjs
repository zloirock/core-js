import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Object$is from "@core-js/pure/actual/object/is";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Mixed static and instance leaves retain native array and static-property reads.
// Each instance keeps its original receiver family, in either property order.
const numbers = {
  methods: Object,
  value: [4, 8]
};
const [,] = [numbers, mark()];
const {
  methods: {
    is: _unused
  }
} = numbers;
const is = _Object$is;
const at = _atMaybeArray(numbers.value);
const text = {
  value: 'abc',
  methods: Math
};
const [,] = [text, mark()];
const includes = _includesMaybeString(text.value);
const {
  methods: {
    sign: _unused2
  }
} = text;
const sign = _Math$sign;
export { is, at, includes, sign };