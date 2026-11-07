// A returned object supplies its own method instead of the constructed prototype method.
class B {
  constructor() { return { value() { return [4, 9]; } }; }
}
class C { value() { return "ab"; } }
Reflect.construct(B, [], C).value().at(-1);
