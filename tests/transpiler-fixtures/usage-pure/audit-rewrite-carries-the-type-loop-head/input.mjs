const loopHead = (function () {
  const rows = ['ab'];
  let seen;
  for (const { at } of rows) seen = at;
  return seen;
})();
export { loopHead };
