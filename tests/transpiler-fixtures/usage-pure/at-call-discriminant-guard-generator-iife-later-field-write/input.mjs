// the discriminant lane bounds a use inside an immediately invoked body at the call's end - the body
// ran there, so a field write after the call cannot reach it. a generator body did NOT run at the
// call and an async body suspends: their reads see the writes below, so the narrow drops and both
// families inject (the synchronous IIFE keeping its narrow is locked beside the loop shape)
type A = { kind: 'a'; v: string };
type B = { kind: 'b'; v: number[] };
export function viaGenerator(o: A | B) {
  if (o.kind === 'a') {
    const it = (function* () { yield o.v.at(0); })();
    o.kind = 'b';
    o.v = [1, 2];
    return it;
  }
  return null;
}
export function viaAsync(o: A | B) {
  if (o.kind === 'a') {
    const p = (async () => { await 0; return o.v.includes('x'); })();
    o.kind = 'b';
    o.v = [1, 2];
    return p;
  }
  return null;
}
