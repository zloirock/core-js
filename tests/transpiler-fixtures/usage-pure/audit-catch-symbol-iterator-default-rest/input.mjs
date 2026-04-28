// catch param destructuring with computed Symbol.iterator key carrying a default plus
// a rest gather. exercises both the iterator-method synth path (renamed `_unused`) and
// the AssignmentPattern wrapper - default fallback fires only when extracted value is
// undefined, then the residual destructure leaves rest pointing at the original error
try {} catch ({ [Symbol.iterator]: it = fallback, ...rest }) {
  it();
  rest;
}
