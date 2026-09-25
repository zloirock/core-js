// a receiver-less static extracted off a call into a MEMBER target: the target takes the polyfill
// like a binding would - beside an instance sibling that reads the call's value, in either order, and
// beside a second member target or a binding, which the residual count sees as surely as a binding
function make() { log(); return Iterator; }
function makeArray() { log(); return Array; }
function makePromise() { log(); return Promise; }
const ob = {};
({ from: ob.a } = make());
let sn;
({ concat: ob.b, name: sn } = make());
({ name: ob.n, zip: ob.c } = make());
({ from: ob.d, of: ob.e } = makeArray());
let x;
({ try: x, withResolvers: ob.f } = makePromise());
use(ob, sn, x);
