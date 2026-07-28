import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
// pure flavor: the own data property under a built-in's name needs no helper at all while the
// receiver is provable, and the field it holds keeps its precise family. the leaked twin loses
// both - the collision becomes a real instance-method access and the field widens
const bag = {
  entries: [1, 2],
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.entries).call(_ref, 0);
  }
};
bag.read();
export const leaked = {
  keys: [1, 2],
  read() {
    var _ref2;
    return _includes(_ref2 = _keys(this)).call(_ref2, 1);
  }
};