// a union branch that aliases a nullish keyword (`type N = null;`) makes `Inner | N` carry N as
// a TypeReference at the flatten step. the ref must be resolved to its `null` body (TSNullKeyword)
// so the nullish-branch filter can exclude N and narrow cleanly when `x.kind === 'a'` holds.
// braced if-body so the emitted `var _ref;` lands in the same slot across both runners.
type N = null;
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
type Outer = Inner | N;
declare const x: Outer;
if (x.kind === 'a') {
  x.data.at(0);
}
