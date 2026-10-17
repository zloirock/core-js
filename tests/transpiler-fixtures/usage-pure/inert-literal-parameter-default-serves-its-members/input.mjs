// Inert literal defaults retain the Iterator and Array family facts of their default paths. A supplied
// argument remains the actual receiver: pure body-entry dispatch preserves its own properties, while
// global usage injects the possible families without rewriting the parameter.
function h1({ from: s1, name: nm1 } = [Iterator][0]) { return [s1, nm1]; }
function h2({ at: a2 } = [[1, 2]][0]) { return a2; }
const h3 = ({ concat: c3, name: nm3 } = ({ I: Iterator }).I) => [c3, nm3];
use(h1, h2, h3);
