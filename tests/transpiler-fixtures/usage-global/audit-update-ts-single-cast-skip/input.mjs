// single TS cast / non-null wrapping update operands - read side still polyfilled.
// gated behind `if (false)` because assigning to a global is user-bug
if (false) {
  (Map as any)++;
  --(Set as any);
  Promise!++;
  --WeakMap!;
}
