import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// an assignment-form alias registers the span its BINDING is visible in, by the binding's kind: a
// `let` reaches its declaring block only, so a same-named read outside that block is not this alias
// and stays native - it throws the ReferenceError the source throws - while the read inside the
// block keeps the static. the two reads take different statics of the same global, so the outer one
// cannot hide behind the inner one's module
export function f() {
  {
    let O;
    ({
      Object: O
    } = _globalThis);
    _Object$fromEntries([]);
  }
  return O.groupBy([1], v => v);
}