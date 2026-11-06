import _at from "@core-js/pure/actual/instance/at";
function shadowed<Array>(x: Array) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _at(x).call(x, 0);
}