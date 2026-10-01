// indexed-access into abstract class members (`Repo['cache']` / `Repo['load']`) resolves to each
// member's annotated type on BOTH parsers, so `.union` narrows to Set and `.getOrInsert` to Map -
// a cross-parser parity guard for abstract-member type resolution
abstract class Repo {
  abstract cache: Set<number>;
  abstract load(): Map<string, number>;
}
function use(x: Repo['cache'], f: Repo['load']) {
  x.union(new Set());
  f().getOrInsert('k', 0);
}
