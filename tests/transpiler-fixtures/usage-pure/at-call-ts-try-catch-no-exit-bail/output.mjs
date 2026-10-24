import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      doFirst();
      return;
    } catch {
      logFailure();
    }
  }
  // @ts-expect-error a union whose other arm lacks the member is the shape under test
  _atMaybeArray(x).call(x, -1);
}