// A computed method key folds through a concat or template while its effects stay ordered.
// A discarded proxy-global leaves no pending rewrite against the removed key.
// The receiver is evaluated before that prefix, even when the proxy read later folds away.
// Distinct methods keep the instance, static and effectful rows observable.
const arr = [[1]];
let n = 0;
const binaryFold = arr[(globalThis, "fl") + "at"]();
const templateFold = arr[`flat${ (globalThis, "") }Map`](x => [x]);
const staticFold = Array[(self, "fr") + "om"]([1, 2]);
const seFold = arr[(n++, globalThis, "inclu") + "des"]([1]);
export { binaryFold, templateFold, staticFold, seFold, n };
