// `const enum Set { ... }` inside a class StaticBlock. const enums are still TS runtime
// shadow bindings until tsc inlines them, so the local `Set` must shadow the global Set
// the same as a regular `enum` declaration
let captured: unknown;
class C {
  static {
    const enum Set { Foo, Bar }
    captured = Set.Foo;
  }
}
export { C, captured };
