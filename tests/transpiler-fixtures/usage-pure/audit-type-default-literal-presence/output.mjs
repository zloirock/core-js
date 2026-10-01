import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// literal-init presence drives the defaulted-binding type: a plain value kills the default
// (member-only), a literal undefined fires it (default-only), and an accessor / method match
// stays undecided - the member x default fold keeps both sides (a false 'absent' narrowed a
// getter-supplied array to the default's string flavor)
const {
  p = ''
} = {
  p: [1]
};
_atMaybeArray(p).call(p, 0);
const {
  u = 'x'
} = {
  u: undefined
};
_atMaybeString(u).call(u, 0);
const {
  g = ''
} = {
  get g() {
    return [2];
  }
};
_at(g).call(g, 1);