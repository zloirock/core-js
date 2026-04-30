import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// multiple class decorators stacked. each decorator's argument may carry independent
// polyfillable expressions. decorator visitor must walk all three without skipping.
@dec1(_at(arr).call(arr, 0))
@dec2(_includes(other).call(other, z))
@dec3(_Promise$resolve(0))
class C {}