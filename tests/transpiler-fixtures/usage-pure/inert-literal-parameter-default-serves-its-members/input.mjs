// a parameter default spelled as an element of an INERT literal (`[Iterator][0]`, `[[1, 2]][0]`,
// `({ I: Iterator }).I`) serves the statics and instance members destructured off it, as the direct
// spelling does; a caller's own argument still destructures natively
function h1({ from: s1, name: nm1 } = [Iterator][0]) { return [s1, nm1]; }
function h2({ at: a2 } = [[1, 2]][0]) { return a2; }
const h3 = ({ concat: c3, name: nm3 } = ({ I: Iterator }).I) => [c3, nm3];
use(h1, h2, h3);
