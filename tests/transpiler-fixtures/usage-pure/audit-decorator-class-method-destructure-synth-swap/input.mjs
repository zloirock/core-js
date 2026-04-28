// class-level decorator combined with a method whose destructure default triggers
// synth-swap. plugin processes the decorator expression first (no polyfillables there)
// then walks into the class body and applies the standard `{ from: _Array$from }`
// rewrite to `method`. decorator preserved verbatim
@dec
class C {
  method({ from } = Array) {
    return from([1]);
  }
}
