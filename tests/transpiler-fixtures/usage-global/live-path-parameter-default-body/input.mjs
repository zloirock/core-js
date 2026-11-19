// Extracted defaults keep the earlier statement and the later array binding.
export const log = [];
export const value = (function read({ from, ...rest } = Array, list = [1]) {
  log.push(1);
  const [, { includes }] = [0, list];
  return [typeof from, typeof includes, typeof rest];
})();
