// a var-hoisted alias whose middle hop is shadowed by a param resolves through the hop's
// module-scope declaration (the hoisted binding falls back to its function scope)
const objRoot = Object;
const objLink = objRoot;
export function viaVarHoist(objRoot) {
  var held = objLink;
  const { groupBy } = held;
  return groupBy([], x => x);
}
