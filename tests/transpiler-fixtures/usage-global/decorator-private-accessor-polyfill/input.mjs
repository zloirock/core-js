// stage-3 auto-accessor with private name + decorator + polyfillable initializer.
// Decorator may invoke `Symbol.metadata`; the initializer constructs a Map (polyfill
// needed pre-ES2015). Private accessor is scope-closed - external writes can't mutate
class C {
  @dec accessor #foo = new Map();
}
