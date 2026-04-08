var _ref;
import _at from "@core-js/pure/actual/instance/at";
declare const cond: boolean;
class Box {
  get data() {
    if (cond) return [1, 2, 3];
    return 'hello';
  }
}
_at(_ref = new Box().data).call(_ref, -1);