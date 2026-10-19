// nested TS casts (`as any as unknown`) / non-null (`!`) around update operands - the read
// side still needs the polyfill. gated behind `if (false)` because assigning to a global is
// user-bug and would runtime-clobber Map / Set / WeakMap
if (false) {
  // @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
  (Map as any as unknown)++;
  // @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
  --(Set as any as unknown);
  (WeakMap! as any)++;
}
