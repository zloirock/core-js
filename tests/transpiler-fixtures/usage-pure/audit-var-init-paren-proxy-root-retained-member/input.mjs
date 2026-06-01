// a parenthesized proxy-global root in a retained-receiver init: the polyfilled key (`from`)
// hoists while the unpolyfilled key (`other`) keeps the collapsed receiver. the close paren must
// drop together with the hop so the retained member doesn't leave a dangling open paren
const { from, other } = (globalThis).self.Array;
from([1]);
other;
