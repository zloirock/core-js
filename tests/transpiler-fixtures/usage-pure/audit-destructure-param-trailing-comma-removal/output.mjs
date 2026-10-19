import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// these shapes SYNTH their receiver: the caller-correct literal is preferred over editing the
// pattern, so no prop is removed. what they lock is that a trailing comma does not push the
// pattern off the synth path
(function ({
  'from': f
}) {
  return f;
})({
  'from': _Array$from
});
(function ({
  'from': f,
  'of': o
}) {
  return [f, o];
})({
  'from': _Array$from,
  'of': _Array$of
});
// a block comment between the sole prop and its trailing comma stays behind the prop
(function ({
  'of': o /* keep me out */
}) {
  return o;
})({
  'of': _Array$of
});