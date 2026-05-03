import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// findNamespacedFunctionPath stress test: 4-segment qualified `typeof` reference
// `Outer.Mid.Inner.fn`. walkScopesForDecl traverses one TSModuleDeclaration per
// segment. Confirms recursive descent works past 2-3 segment depth (typical fixtures
// only cover 2-3 segments). ReturnType<typeof Outer.Mid.Inner.fn> should pick the
// declared return shape (number[]) so .at(0) emits Array.at polyfill.
declare namespace Outer {
  namespace Mid {
    namespace Inner {
      function fn(): number[];
    }
  }
}
const r: ReturnType<typeof Outer.Mid.Inner.fn> = [1, 2, 3];
_atMaybeArray(r).call(r, 0);