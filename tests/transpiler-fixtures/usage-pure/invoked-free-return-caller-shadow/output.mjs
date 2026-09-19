// A free return resolves at the declaration, outside the caller's shadow.
function pick() {
  return Array;
}
function install(Array) {
  pick.call(null).from = patched;
}
install({});
export const result = Array.from([1]);