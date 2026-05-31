// loop back-edge: `x` is initialised to an array but reassigned to a string at the loop tail, so
// from the 2nd iteration the top-of-loop `x.at()` runs on a string. the declarator-init narrow is
// stale - the polyfill degrades to the generic instance variant, not the array-specific one.
declare function cond(): boolean;
declare function readString(): string;
let x = [1, 2, 3];
while (cond()) {
  x.at(-1);
  x = readString();
}
