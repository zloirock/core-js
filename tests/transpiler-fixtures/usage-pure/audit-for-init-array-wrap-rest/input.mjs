// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
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
