import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 11:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const c = 1;
const userObj = {};
const arr = [1, 2];
const nb = {
  y: arr
};
const rest = [];
const more = {};
const wrapped = [Object];
const log = [];
const obj = {};
const rows = [];
const k = 'k';
let kw;
const nul = null;
function eff() {
  return Object;
}
function eff2() {}
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  try {
    throw {
      w: [1]
    };
  } catch (_ref) {
    let a = _at(_ref.w);
    let {
      [(eff('k'), 'w')]: _unused
    } = _ref;
    a;
  }
}
{
  try {
    throw {
      w: [1]
    };
  } catch (_ref2) {
    let a = _at(_ref2.w);
    let {
      [(eff('k'), 'w')]: _unused2
    } = _ref2;
    _pushMaybeArray(log).call(log, a.call([5], 0));
  }
}
{
  eff();
  var values = _values(r.w);
  var at = _at(r.y);
  [values, at];
}
{
  var t = 0;
  const _ref3 = [1];
  var {
      [(k++, 'at')]: _unused3
    } = _ref3,
    a = _atMaybeArray(_ref3);
}
{
  const _ref4 = [1];
  var {
      [(k++, 'at')]: _unused4
    } = _ref4,
    a = _atMaybeArray(_ref4),
    t = 0;
}