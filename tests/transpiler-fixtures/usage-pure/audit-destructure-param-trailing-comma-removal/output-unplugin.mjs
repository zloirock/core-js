import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// these shapes now SYNTH their receiver: the caller-correct literal is preferred over the text
// splice, so no prop is removed and no comma has to be consumed here. what they lock is that a
// trailing comma does not push the pattern off the synth path. the splice and its comma handling
// are exercised where a dynamic computed key makes the literal impossible
(function ({ 'from': f, }) {
  return f;
})({ "from": _Array$from });
(function ({ 'from': f, 'of': o, }) {
  return [f, o];
})({ "from": _Array$from, "of": _Array$of });
// a block comment between the sole prop and its trailing comma must not hide the comma from the
// removal scan, or the same orphaned-comma syntax error returns
(function ({ 'of': o /* keep me out */, }) {
  return o;
})({ "of": _Array$of });