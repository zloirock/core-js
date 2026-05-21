import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// StaticBlock (`class C { static { ... } }`) - getStatementSiblings used to recognise
// only BlockStatement / Program / SwitchCase containers and return null for the static
// block's `body` listKey, so preceding early-exit guards inside `static { ... }` never
// surfaced to the narrowing pipeline. fixture exercises the path: typeof-throw guard
// followed by an array access; narrow must reach the throw's negation and pick array
declare const x: string | string[];
class Holder {
  static {
    if (!Array.isArray(x)) throw new Error('expected array');
    _atMaybeArray(x).call(x, 0);
  }
}
Holder;