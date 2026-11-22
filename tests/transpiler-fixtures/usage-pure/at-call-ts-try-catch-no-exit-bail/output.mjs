import _at from "@core-js/pure/actual/instance/at";
function example(x: string | string[]) {
  if (typeof x === 'string') {
    try {
      doFirst();
      return;
    } catch {
      logFailure();
    }
  }
  _at(x).call(x, -1);
}