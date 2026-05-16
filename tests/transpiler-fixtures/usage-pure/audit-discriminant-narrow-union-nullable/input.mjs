// discriminated union wrapped in `| null` -- the outer union's branches are [Inner, null].
// previously branchMatchesGuards was permissive on the null branch (no `kind` member,
// passed through), so narrowing degraded to the full `Inner | null` union and `x.data`
// resolved to a heterogeneous type, falling to generic `.at` dispatch. fix: nullish-
// keyword branches (TSNullKeyword) excluded outright -- any property-access guard would
// TypeError on null at runtime, so the branch is unreachable in the guarded scope.
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
declare const x: Inner | null;
if (x.kind === 'a') {
  x.data.at(0);
}
