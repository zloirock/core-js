// generic alias whose body wraps the type-param inside `TSArrayType` — `applyAliasSubst`
// (shallow) wouldn't substitute T inside `T[]`, losing the inner Array type for `.at`
// inference. `applyAliasSubstDeep` descends into TSArrayType and resolves correctly
type G<T> = Generator<T[]>;
function* gen(): G<string> { yield ['x']; }
for (const x of gen()) {
  globalThis.__r = x.at(0);
  break;
}
