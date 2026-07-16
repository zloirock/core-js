import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A guarded-static tagged template inside a JSX expression container: the JSX gates must
// not swallow the guard render, and the raw branch still binds the receiver like a call
function App(c) {
  let M;
  c ? ({ Map: M } = _globalThis) : 0;
  return <div data-x={(M === _Map ? _Map$groupBy : M.groupBy.bind(M))`items`} />;
}
export default App;