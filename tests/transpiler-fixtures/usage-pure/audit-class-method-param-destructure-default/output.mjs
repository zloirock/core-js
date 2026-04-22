import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// ClassMethod / ObjectMethod param destructure with proxy-global default:
// `{ from } = Array` gives `from` the value of `Array.from` when the method is invoked
// without an arg. ClassMethod/ObjectMethod are AST node types that don't appear under
// `FunctionExpression` in babel's tree - the param-owner recognition has to include them
class C {
  upper({
    from
  } = {
    from: _Array$from
  }) {
    return from([1, 2]);
  }
}
const obj = {
  lower({
    of
  } = {
    of: _Array$of
  }) {
    return of(3, 4);
  }
};
_globalThis.__r = [new C().upper(), obj.lower()];