// A LOOP HEAD binds per iteration and has no declaration a claim could extract into, so the head takes a minted name and the
// pattern moves to the body's first statement - the catch param's own relocation, one host over.
const rows = [[1, [2]], [3]];
const bodyless = (function () {
  let seen;
  for (const { flat } of rows) seen = flat;
  return seen;
})();
export { bodyless };
