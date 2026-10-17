import _Map from "@core-js/pure/actual/map";
// A literal container pairs the hop key with its slot on parameter defaults, loop elements and
// IIFE arguments. Constructors and statics can mirror that slot; a plain instance parameter
// dispatches on the actual supplied receiver. A completed mirror is never mirrored again:
// a pattern-valued leaf under a mirrored static receives the ponyfill value.
function paramHop({
  w: {
    Map: viaParamCtor
  }
} = {
  w: {
    Map: _Map
  }
}) {
  return viaParamCtor;
}
export default [paramHop()];