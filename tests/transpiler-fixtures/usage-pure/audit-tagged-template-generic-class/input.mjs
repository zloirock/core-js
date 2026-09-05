// Tagged template against a class instance method whose return type uses generic subst.
// resolving the class member's return type builds a type-param map with callPath = TTE.
// callPath.get('arguments') has no .node on TTE - exercises that fallback path.
declare class Box<T> {
  pull<U>(strs: TemplateStringsArray): U[];
}
declare const b: Box<number>;
const r = b.pull<string>`hello`;
r.at(0);
