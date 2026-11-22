import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function example(x: string | string[]) {
  if (typeof x === 'string') {
    try {
      doFirst();
      return;
    } catch {
      throw new Error();
    }
  }
  _atMaybeArray(x).call(x, -1);
}