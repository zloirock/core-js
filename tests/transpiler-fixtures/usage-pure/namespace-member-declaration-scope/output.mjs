import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Row = string;
namespace Model {
  type Row = number[];
  export interface Base {
    data: Row;
  }
  export interface View extends Base {}
}
export function first(box: Model.View) {
  var _ref;
  return _atMaybeArray(_ref = box.data).call(_ref, 0);
}