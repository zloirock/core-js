// a parenthesized proxy-global root in a retained-receiver init: the polyfilled key extracts, and the
// unpolyfilled key keeps the receiver in a residual that reads it through the collapsed `self` hop.
const { from, other } = (globalThis).self.Array;
from([1]);
other;
