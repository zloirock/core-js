import _at from "@core-js/pure/actual/instance/at";
// Type-assertion call reached through an optional chain (`obj?.api?.assertStr(input)`):
// any nullish hop short-circuits, so the assertion is not guaranteed and `input` is not
// narrowed. `input.at(0)` emits the generic instance polyfill.
declare const obj: {
  api?: { assertStr(x: unknown): asserts x is string };
} | undefined;

function take(input: unknown) {
  obj?.api?.assertStr(input);
  return _at(input).call(input, 0);
}