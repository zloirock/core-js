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
    let _ref3 = _ref,
      {
        [(eff('k'), 'w')]: _ref2
      } = null == _ref3 ? _ref3[""] : _ref3,
      _ref4 = _ref2,
      a = null == _ref4 ? _ref4[""] : _at(_ref4);
    a;
  }
}
{
  try {
    throw {
      w: [1]
    };
  } catch (_ref5) {
    let _ref7 = _ref5,
      {
        [(eff('k'), 'w')]: _ref6
      } = null == _ref7 ? _ref7[""] : _ref7,
      _ref8 = _ref6,
      a = null == _ref8 ? _ref8[""] : _at(_ref8);
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
  var t = 0,
    _ref9 = [1],
    a = null == _ref9 ? _ref9[""] : (k++, _atMaybeArray(_ref9));
}
{
  var _ref10 = [1],
    a = null == _ref10 ? _ref10[""] : (k++, _atMaybeArray(_ref10)),
    t = 0;
}