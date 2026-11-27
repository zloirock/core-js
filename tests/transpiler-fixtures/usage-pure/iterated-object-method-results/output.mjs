import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
const first = [];
for (const obj of [{
  read() {
    return [7];
  }
}, {
  read() {
    return 'word';
  }
}]) {
  var _ref;
  (_pushMaybeArray(first) || 0).call(first, _at(_ref = obj.read()).call(_ref, 0));
}
export { first };