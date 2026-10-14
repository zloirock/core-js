import _Reflect$getPrototypeOf from "@core-js/pure/actual/reflect/get-prototype-of";
import _self from "@core-js/pure/actual/self";
// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT receiver
// collapses the hop - `globalThis.self` is undefined off-browser. A left whose namespace entry is excluded
// (`Reflect`, while `getPrototypeOf` keeps its own) still decides - the data subset carries `Reflect` - so the
// pure-constructor right (`globalThis.self.Set`) never runs and leaves with its import.
function g({
  getPrototypeOf: _unused,
  ...rest
} = _self.Reflect) {
  let getPrototypeOf = _Reflect$getPrototypeOf;
  return getPrototypeOf([]);
}
g();