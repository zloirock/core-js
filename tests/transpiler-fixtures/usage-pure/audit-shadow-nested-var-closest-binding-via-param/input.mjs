// negatives: a declaration INSIDE the var's hoist owner keeps the native view - a same-name
// param, a nearer block `let`, a catch param; and a var inside an INNER function never leaks
// out to shadow the outer alias
export function viaParam(Promise) {
  { var Promise = { resolve: () => 'p' }; }
  return Promise.resolve('x');
}
