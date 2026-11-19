import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// findObjectMember bails on ANY spread (not just spread-after-key).
// Spread before the searched key cannot affect resolution semantically when the key
// is later defined explicitly: own definition supersedes any spread copy.
// Documents current conservative bail; spread runs first, then explicit key overrides.
const base = {
  foo: 1
};
const obj = {
  ...base,
  foo: [1, 2, 3]
};
const r = obj.foo;
_atMaybeArray(r).call(r, 0);