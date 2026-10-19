// single TS cast / non-null wrapping update operands - read side still polyfilled.
// gated behind `if (false)` because assigning to a global is user-bug
if (false) {
  (Map as any)++;
  --(Set as any);
  // @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
  Promise!++;
  // @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
  --WeakMap!;
}
