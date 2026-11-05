// A literal-object parameter default remains the native source of its Map slot.
// Only its globalThis reference is replaced.
function paramHop({ w: { Map: viaParamCtor } } = { w: globalThis }) {
  return viaParamCtor;
}
export default [paramHop()];
