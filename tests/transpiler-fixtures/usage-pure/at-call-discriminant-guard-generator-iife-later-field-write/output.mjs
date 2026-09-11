import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// the discriminant lane bounds a use inside an immediately invoked body at the call's end - the body
// ran there, so a field write after the call cannot reach it. a generator body did NOT run at the
// call and an async body suspends: their reads see the writes below, so the narrow drops and both
// families inject (the synchronous IIFE keeping its narrow is locked beside the loop shape)
type A = {
  kind: 'a';
  v: string;
};
type B = {
  kind: 'b';
  v: number[];
};
export function viaGenerator(o: A | B) {
  if (o.kind === 'a') {
    const it = function* () {
      var _ref;
      yield _at(_ref = o.v).call(_ref, 0);
    }();
    o.kind = 'b';
    o.v = [1, 2];
    return it;
  }
  return null;
}
export function viaAsync(o: A | B) {
  if (o.kind === 'a') {
    const p = (async () => {
      var _ref2;
      await 0;
      return _includes(_ref2 = o.v).call(_ref2, 'x');
    })();
    o.kind = 'b';
    o.v = [1, 2];
    return p;
  }
  return null;
}