import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// top-level `await` is ESM-only syntax (parser would reject in script context).
// without recognizing TLA as an ESM marker, `module.exports = ...` further down would
// flip importStyle to `require`, producing mixed `require()` + TLA which crashes at runtime
// (CJS modules can't have TLA). detectCommonJS now treats top-level AwaitExpression as
// strong ESM marker so importStyle stays `import`
await _Promise$resolve(1);
module.exports = {
  x: _atMaybeString(_ref = 'test').call(_ref, -1)
};