// resolveTypedMember TSTypeQuery branch routed THROUGH a type alias: `type Q = typeof ref`,
// `declare const m: Q`. annotation on `m` is TSTypeReference 'Q' (not TSTypeQuery directly),
// so resolveTypedMember peels the alias chain via `followTypeAliasChain` to reach the
// TSTypeQuery node. resolveTypeQueryBinding then follows `typeof ref` -> ref's init Mod
// (Identifier) -> resolvePath walks to the ClassDeclaration. resolveClassMember fires for
// each static method, returning their declared return types. distinct methods so each
// return type tracks back to its specific class signature; both string[] (Array narrow)
// and string (String narrow) emit precise polyfill imports
class Mod {
  static fetchOne(): string[] { return []; }
  static fetchTwo(): string { return ''; }
}
const ref = Mod;
type Q = typeof ref;
declare const m: Q;
m.fetchOne().findLast(s => s);
m.fetchOne().at(0);
m.fetchTwo().includes('z');
