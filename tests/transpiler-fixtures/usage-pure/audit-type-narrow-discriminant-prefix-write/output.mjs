import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a write to a PREFIX of the discriminant path replaces the object that holds it, so the
// guarded variant no longer describes the value: `u.m = other.m` invalidates a narrow taken
// under `u.m.k === 'a'` exactly like writing `u.m.k` itself would
type Multi = {
  m: {
    k: 'a';
  };
  val: string;
  other: number;
} | {
  m: {
    k: 'b';
  };
  val: number[];
  other: number;
};
export function prefixWrite(u: Multi, other: Multi) {
  if (u.m.k === 'a') {
    var _ref;
    u.m = other.m;
    return _at(_ref = u.val).call(_ref, 0);
  }
  return undefined;
}
// writing the discriminant's OWN deep path invalidates the variant just as directly - depth is
// not what makes a write irrelevant, landing off the discriminant path is
export function exactWrite(u: Multi) {
  if (u.m.k === 'a') {
    var _ref2;
    u.m.k = 'b';
    return _includes(_ref2 = u.val).call(_ref2, 'x');
  }
  return undefined;
}
// an UNRELATED field write leaves the discriminant intact - the narrow survives
export function unrelatedWrite(u: Multi) {
  if (u.m.k === 'a') {
    var _ref3;
    u.other = 5;
    return _atMaybeString(_ref3 = u.val).call(_ref3, 0);
  }
  return undefined;
}
// no write at all keeps the narrow too
export function noWrite(u: Multi) {
  var _ref4;
  return u.m.k === 'a' ? _atMaybeString(_ref4 = u.val).call(_ref4, 0) : undefined;
}