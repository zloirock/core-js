import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
var _ref2, _ref3;
const log = [];
function make(change) {
  const holder = {
    items: [7]
  };
  if (change) holder.items = "abc";
  return holder;
}
const box = {
  __proto__: {
    get touch() {
      _pushMaybeArray(log).call(log, "get");
      this.items = "xyz";
    }
  },
  items: [4],
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, -1);
  }
};
const first = box.read();
void box.touch;
export const result = [_at(_ref2 = make(false).items).call(_ref2, 0), _at(_ref3 = make(true).items).call(_ref3, 0), first, box.read(), log];