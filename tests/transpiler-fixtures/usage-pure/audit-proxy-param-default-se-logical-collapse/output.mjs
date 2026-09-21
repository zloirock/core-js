import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
function effect() {}
function f({
  from: _unused,
  ...rest
} = (effect(), _self.Array || _Set)) {
  let from = _Array$from;
  return from([1]);
}
f();