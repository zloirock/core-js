// bare destructure inside array-pattern element - no static receiver to anchor a polyfill,
// caller-passed value flows through unchanged
function f([{
  from
}]) {
  return from?.([1]);
}
f([Array]);