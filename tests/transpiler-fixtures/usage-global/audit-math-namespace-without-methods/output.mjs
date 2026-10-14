import "core-js/modules/es.global-this";
// a namespace read as a VALUE escapes: `Math` handed to an exported binding pulls none of the
// `es.math.*` modules, `@@toStringTag` included - core-js defines no module for the namespace itself,
// and its methods load where a read names them. the guard beside it is the other channel: an
// existence test of the namespace pins `globalThis` alone
export const supported = globalThis.Math ? 'yes' : 'no';
export const escaped = Math;