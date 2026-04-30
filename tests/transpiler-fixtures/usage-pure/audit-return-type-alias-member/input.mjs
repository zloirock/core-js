// `ReturnType<Fn>.x` where `Fn` is a direct function-type alias (no `typeof`) -
// `getTypeMembers` previously only handled `ReturnType<typeof fn>` (TSTypeQuery arg) and
// bailed on the alias form. parity with `resolveNamedType`'s ReturnType branch: follow
// the alias chain, extract the function's return annotation, then resolve members.
// without the fix, the `.at(0)` dispatch falls through to generic `_at`
type Fn = () => string[];
declare const xs: ReturnType<Fn>;
xs.at(0);
