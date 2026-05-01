import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Tagged template via static method that has type-args at call site (which TaggedTemplateExpression
// supports). Verifies callPath handling when callPath has typeParameters but no `arguments` key.
declare class Box {
  static make<T>(strs: TemplateStringsArray): T[];
}
const r = Box.make<string>`hello`;
_atMaybeArray(r).call(r, 0);