import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
const seen = [];
// an ALIAS is proven by the VALUE canon, the same one the declaration twin reads it through: the
// mirror spells the constructor the alias holds, since what a const binding holds is not in doubt.
// what the head still cannot serve is a MIXED literal above - one element per pass is unspellable
const Ctor = Object;
for (const {
  fromEntries: viaAlias
} of [{
  fromEntries: _Object$fromEntries
}]) {
  _pushMaybeArray(seen).call(seen, typeof viaAlias);
}
export { seen };