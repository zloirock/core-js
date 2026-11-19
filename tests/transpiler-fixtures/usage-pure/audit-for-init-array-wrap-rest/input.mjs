// For-init captures serve statics beside rest while preserving each rest exclusion.
// The static-only wrapper with a neighbouring element keeps its native from read.
for (const [{ of, ...r }] = [Array]; ; ) {
  of(1);
  break;
}
for (const [{ from }, extra] = [Array, 1]; ; ) {
  from([2, extra]);
  break;
}
// a multi-declarator header takes the sibling polyfill mid-list
for (let i = 0, [{ fromAsync, ...more }] = [Array]; i < 1; i++) {
  fromAsync([i]);
}
