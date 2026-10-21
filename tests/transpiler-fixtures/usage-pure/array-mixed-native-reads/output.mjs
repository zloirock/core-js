import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
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