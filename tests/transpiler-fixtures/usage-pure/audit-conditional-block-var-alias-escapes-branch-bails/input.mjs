// The var binding hoists, but its realm initializer runs only in the selected branch.
// The later read may observe either the realm or undefined. Pure must retain that read
// and guard the constructor before choosing the static polyfill.
function f() {
  if (c) { var M = globalThis; }
  M.Array.from([1]);
}
