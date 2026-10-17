import _at from "@core-js/pure/actual/instance/at";
// two siblings on the directive line where the SECOND spans further - the farthest end must win
// or the second statement's continuation line leaks
// core-js-disable-next-line
use(o.flat(2));
// core-js-disable-next-line
use(p.with(1, z));
export const afterSiblings = _at(q).call(q, -1);