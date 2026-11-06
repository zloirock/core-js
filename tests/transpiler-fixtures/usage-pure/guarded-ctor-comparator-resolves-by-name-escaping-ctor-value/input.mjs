export function escapingCtorValue(c, sink) {
  let P;
  if (c) P = globalThis.Promise;
  sink(P);
  return P.allSettled;
}
