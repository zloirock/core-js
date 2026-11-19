import "core-js/modules/es.array.push";
// A constructor result and an array in another function share a local name.
// Writes to the array cannot supply values for the constructor result's member chain.
// Repeated opaque arguments must terminate normally and retain the push polyfill.
export function make(Format) {
  const r = new Format();
  return r.x.y;
}
export function collect(a) {
  const r = [];
  r.push(a.b, a.b);
  return r;
}