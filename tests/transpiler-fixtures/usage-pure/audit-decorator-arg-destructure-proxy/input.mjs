// decorator argument contains a destructure pattern with the polyfillable receiver `Array`
// as the AssignmentPattern default. synth-swap must rewrite `= Array` to `= { from: _Array$from }`
// so the arrow body's `from([...])` resolves to the polyfill even inside the decorator expression
@dec(({from} = Array) => from([1, 2, 3]))
class C {}
function dec(fn) { return t => t; }
