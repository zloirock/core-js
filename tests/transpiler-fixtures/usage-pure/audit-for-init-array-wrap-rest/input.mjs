// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
for (const [{ of, ...r }] = [Array]; ; ) {
  of(1);
  break;
}
for (const [{ from }, extra] = [Array, 1]; ; ) {
  from([2, extra]);
  break;
}
// a multi-declarator header takes the sibling polyfill mid-list
for (let i = 0, [{ isArray, ...more }] = [Array]; i < 1; i++) {
  isArray([i]);
}
