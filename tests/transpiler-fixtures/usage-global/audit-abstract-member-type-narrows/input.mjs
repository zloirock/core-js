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

// Both indexed members select their own instance method.
abstract class Rows {
  abstract cache: number[];
  abstract load(): string;
}
function read(x: Rows['cache'], f: Rows['load']) {
  x.at(0);
  f().includes('k');
}
