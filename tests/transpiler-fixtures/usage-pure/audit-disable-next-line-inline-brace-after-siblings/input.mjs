// two siblings on the directive line where the SECOND spans further - the farthest end must win
// or the second statement's continuation line leaks
// core-js-disable-next-line
use(o.flat(2)); use(
  p.with(1, z));
export const afterSiblings = q.at(-1);
