// merged interface where one sibling places a renamed type-param inside an
// index signature and another sibling places it on a named property. per-sibling
// subst must reach into both shapes so dot-access on any string key resolves to
// the index-signature value type and named-property access resolves to the
// renamed sibling's property type. distinct methods on each receiver line
// (at vs includes) show which sibling each lookup walked through.
interface Foo<T> { [k: string]: T }
interface Foo<U> { otherProp: U }
declare const f: Foo<string[]>;
f.otherProp.at(0);
f.anyDynamicKey.includes("x");
