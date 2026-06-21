import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Multi-level namespace: `namespace N { namespace M { enum E { A, B } } }`. the receiver
// chain `N.M.E` must walk its 3 segments through nested TSModuleDeclaration anchors to the
// enum. Both shapes covered:
//   - non-computed `N.M.E.A` -> number primitive (enum value-kind)
//   - computed `N.M.E[N.M.E.A]` -> string (numeric reverse mapping)
namespace N {
  export namespace M {
    export enum E {
      A,
      B,
    }
  }
}
const head = N.M.E[N.M.E.A];
const value = N.M.E.A;
_includesMaybeString(head).call(head, 'A');
_toFixedMaybeNumber(value).call(value, 0);