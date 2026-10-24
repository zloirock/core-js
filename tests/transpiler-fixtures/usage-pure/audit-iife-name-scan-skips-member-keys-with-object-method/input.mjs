const withObjectMethod = (function m({ values, ...rest } = Object) {
  const o = { m() {} };
  return [values, rest, o];
})();
export { withObjectMethod };
