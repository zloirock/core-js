import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [, _ref] = [source, (effect(), pick) ? Array : other];
const at = _at(source);
const from = _ref === Array ? _Array$from : _ref.from;
let includes, of;
[, _ref2] = [second, (effect(), choose) ? Array : custom];
includes = _includes(second);
({
  of
} = _ref2);
use(at, from, includes, of);