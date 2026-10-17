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
// no write at all keeps the narrow too
export function noWrite(u: Multi) {
  var _ref;
  return u.m.k === 'a' ? _atMaybeString(_ref = u.val).call(_ref, 0) : undefined;
}