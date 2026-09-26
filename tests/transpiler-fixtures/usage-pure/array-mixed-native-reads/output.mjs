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
const [_ref] = [numbers, mark()];
const {
  methods: {
    is: _unused
  }
} = _ref;
const is = _Object$is;
const at = _atMaybeArray(_ref.value);
const text = {
  value: 'abc',
  methods: Math
};
const [_ref2] = [text, mark()];
const includes = _includesMaybeString(_ref2.value);
const {
  methods: {
    sign: _unused2
  }
} = _ref2;
const sign = _Math$sign;
export { is, at, includes, sign };