import _at from "@core-js/pure/actual/instance/at";
function example(x: number | string[]) {
  if (typeof x === 'number') {
    try {
      doFirst();
      return;
    } catch {
      logFailure();
    }
  }
  _at(x).call(x, -1);
}