// ClassMethod / ObjectMethod param destructure with proxy-global default:
// `{ from } = Array` gives `from` the value of `Array.from` when the method is invoked
// without an arg. ClassMethod/ObjectMethod are AST node types that don't appear under
// `FunctionExpression` in babel's tree - the param-owner recognition has to include them
class C {
  upper({ from } = Array) { return from([1, 2]); }
}
const obj = {
  lower({ of } = Array) { return of(3, 4); },
};
globalThis.__r = [new C().upper(), obj.lower()];
