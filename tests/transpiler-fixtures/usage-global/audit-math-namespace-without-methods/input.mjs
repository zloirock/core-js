// a namespace read as a VALUE escapes: `Math` handed to a binding pulls the whole `es.math.*`
// family, `@@toStringTag` included, since nothing bounds what the escaped value is asked for.
// the guard beside it is the other channel: an existence test of the namespace pins `globalThis`
// alone
export const supported = globalThis.Math ? 'yes' : 'no';
export const escaped = Math;
