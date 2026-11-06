// A guarded-static tagged template inside a JSX expression container: the JSX gates must
// not swallow the guard render, and the raw branch still binds the receiver like a call
function App(c) {
  let M;
  c ? ({ Map: M } = globalThis) : 0;
  return <div data-x={M.groupBy`items`} />;
}
export default App;
