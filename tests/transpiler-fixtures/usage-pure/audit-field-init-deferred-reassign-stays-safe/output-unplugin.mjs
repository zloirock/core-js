import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a reassignment inside an INSTANCE field initializer runs at construction, at an unknown time
// relative to this use, so it must not let the positional narrow settle on an unsound type-specific
// helper that would throw on the real value. coexisting with a straight-line reassignment, the
// receiver-dispatching generic helper is the safe emission. uses two methods shared by Array and
// String so each line's import is distinct.
let s = [1];
s = "o";
class C { f = (s = 0); }
_includes(s).call(s, "a");
_at(s).call(s, 0);