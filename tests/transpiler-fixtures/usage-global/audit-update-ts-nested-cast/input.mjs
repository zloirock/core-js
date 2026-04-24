// nested TS casts (`as any as unknown`) / non-null (`!`) around update operands - the read
// side still needs the polyfill. gated behind `if (false)` because assigning to a global is
// user-bug and would runtime-clobber Map / Set / WeakMap
if (false) {
  (Map as any as unknown)++;
  --(Set as any as unknown);
  (WeakMap! as any)++;
}
