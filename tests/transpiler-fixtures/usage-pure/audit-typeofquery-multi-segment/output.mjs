import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `typeof NS.Inner.fn` for 3+ segment qualified names through TS namespaces. babel doesn't
// bind `namespace NS` as a scope value, so resolveTypeQueryBinding's scope-walk misses;
// findNamespacedFunctionPath walks TSModuleDeclaration bodies recursively (via parameterized
// walkStatementsForDecl with isFunctionOrClassDeclaration leaf-match) and lands on `fn`.
// returnType resolves to `string[]` and `r.at(0)` narrows to the array polyfill
namespace NS {
  export namespace Inner {
    export declare function fn(): string[];
  }
}
type R = ReturnType<typeof NS.Inner.fn>;
declare const r: R;
_atMaybeArray(r).call(r, 0);