import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// A selecting factory keeps the static claim on its default arm. Its supplied constructor
// stays native under the existing factory-source proof boundary.
const events = [];
const choose = events.length === 0;
function select() {
  return {
    k: choose ? Array : undefined
  };
}
let _ref2 = false;
const {
    k: _ref = (_ref2 = true, Array)
  } = select(),
  {} = _ref,
  {
    of
  } = _ref2 ? {
    of: _Array$of
  } : _ref,
  {
    [(_pushMaybeArray(events).call(events, 'key'), 'missing')]: value
  } = _ref;
use(of(3), value, events);