// `Inner | undefined` variant. exercises TSUndefinedKeyword in NULLISH_BRANCH_TYPES.
// same narrowing semantics as the null-wrapped case -- undefined branch can't satisfy
// any property-access guard (runtime TypeError on undefined.kind), so excluded outright.
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
declare const x: Inner | undefined;
if (x.kind === 'a') {
  x.data.at(0);
}
