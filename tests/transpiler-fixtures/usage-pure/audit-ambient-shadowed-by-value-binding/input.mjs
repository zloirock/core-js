// a nearer value binding is what the call really reaches: the ambient declaration of the
// same name is only in play when nothing shadows it. the parameter form has no initializer to
// walk, so it fell through to the ambient probe and answered with the other family
declare function make(): number[];
export function viaParam(make: () => string) {
  return make().at(0);
}
export function unshadowed() {
  return make().includes(1);
}
