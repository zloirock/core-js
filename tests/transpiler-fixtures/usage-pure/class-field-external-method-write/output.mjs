import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
class Rows {
  data = [4];
  read() {
    var _ref, _ref2;
    return _at(_ref = _mapMaybeArray(_ref2 = this.data).call(_ref2, x => x)).call(_ref, 0);
  }
}
const rows = new Rows();
const first = rows.read();
const values = rows.data;
values.map = () => "abc";
export const result = [first, rows.read()];