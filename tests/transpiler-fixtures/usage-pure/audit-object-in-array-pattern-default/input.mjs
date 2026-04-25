// destructure-default at function param position fires when the array slot is omitted,
// substituting a polyfill receiver for `from` on engines without native Array.from
function f([{ from } = Array]) {
  return from([1, 2]);
}
f([Array]);