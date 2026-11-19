// A keyed leaf served by name under a member receiver keeps the native read and coercion
// of its hop. With no remaining reader, its capture becomes a binding-free object pattern.
const ns = { box: { w: Array, other: 1 } };
const { w: { [(log('k'), 'from')]: from }, other } = ns.box;
use(from, other);
