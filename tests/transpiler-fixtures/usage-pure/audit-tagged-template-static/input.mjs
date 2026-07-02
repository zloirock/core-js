// Tagged template via static method that has type-args at call site (which TaggedTemplateExpression
// supports). Verifies callPath handling when callPath has typeParameters but no `arguments` key.
declare class Box {
  static make<T>(strs: TemplateStringsArray): T[];
}
const r = Box.make<string>`hello`;
r.at(0);
