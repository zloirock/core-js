import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// generic alias whose body wraps the type-param inside `TSArrayType` — `applyAliasSubst`
// (shallow) wouldn't substitute T inside `T[]`, losing the inner Array type for `.at`
// inference. `applyAliasSubstDeep` descends into TSArrayType and resolves correctly
type G<T> = Generator<T[]>;
function* gen(): G<string> {
  yield ['x'];
}
for (const x of gen()) {
  _globalThis.__r = _atMaybeArray(x).call(x, 0);
  break;
}