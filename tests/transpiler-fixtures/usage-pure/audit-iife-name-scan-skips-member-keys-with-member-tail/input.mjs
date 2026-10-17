const withMemberTail = (function n({ fromEntries, ...rest } = Object) {
  const o = {};
  o.n = 1;
  return [fromEntries, rest, o];
})();
export { withMemberTail };
