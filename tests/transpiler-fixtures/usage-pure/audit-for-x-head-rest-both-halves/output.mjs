import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a REST beside a claim is what the relocation buys room for: the head takes a minted name and the
// pattern moves to the body, where the read renders and the rest stays behind it - reading the same
// minted receiver with the consumed key renamed to a sentinel, so it gathers exactly what the source
// left it. the STATIC half reaches its receiver through the identity guard, the INSTANCE half
// through the dispatcher; both keep the residual
const seen = [];
for (var _ref of [Array]) {
  var from = _ref === Array ? _Array$from : _ref.from,
    {
      from: _unused,
      ...staticRest
    } = _ref;
  _pushMaybeArray(seen).call(seen, typeof from, 'from' in staticRest);
}
for (var _ref2 of [[1, 2]]) {
  var at = _atMaybeArray(_ref2);
  var {
    at: _unused2,
    ...instanceRest
  } = _ref2;
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in instanceRest);
}
export { seen };