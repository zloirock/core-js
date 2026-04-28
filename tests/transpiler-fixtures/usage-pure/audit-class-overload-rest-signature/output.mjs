import _Set from "@core-js/pure/actual/set/constructor";
// regular class with overload signatures - the type-only signatures are also
// TSEmptyBodyFunctionExpression on MethodDefinition.value, separate from the
// implementation. The rest-param sigs would crash the scope crawler without
// neutralization. The implementation body is left untouched. Unrelated polyfill
// below confirms the transform completes
class C {
  m(...args: string[]): string;
  m(...args: number[]): number;
  m(...args: any[]): any {
    return args[0];
  }
}
declare const set: Set<number>;
set.union(new _Set());