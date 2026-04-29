// TS constructor type with type parameters as a type-only reference: must not trigger
// runtime polyfill emission.
type Wrapper<T> = { create: new () => T };
function getWrapper(): Wrapper<string[]> {
  return { create: Array };
}
new (getWrapper().create)().at(0);
