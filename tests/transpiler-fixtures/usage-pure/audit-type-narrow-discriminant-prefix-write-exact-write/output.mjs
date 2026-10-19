import _includes from "@core-js/pure/actual/instance/includes";
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
// writing the discriminant's OWN deep path invalidates the variant just as directly - depth is
// not what makes a write irrelevant, landing off the discriminant path is
export function exactWrite(u: Multi) {
  if (u.m.k === 'a') {
    var _ref;
    // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
    u.m.k = 'b';
    // @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
    return _includes(_ref = u.val).call(_ref, 'x');
  }
  return undefined;
}