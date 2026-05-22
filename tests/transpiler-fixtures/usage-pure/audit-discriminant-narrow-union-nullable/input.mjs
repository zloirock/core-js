// Discriminated union wrapped in `| null`: the `if (x.kind === 'a')` guard narrows
// `x` to the array branch (the `null` branch is unreachable under property access),
// so `x.data.at(0)` emits the array-instance polyfill.
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
