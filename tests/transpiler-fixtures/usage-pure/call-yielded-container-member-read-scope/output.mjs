import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Math$log10 from "@core-js/pure/actual/math/log10";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a member read through a call's container keeps the call where it has an effect, resolves a name
// the callee spells in the callee's scope - past a namesake at the call site - and reads natively
// where the slot's argument is unknown. one static per row
const noisy = value => {
  _pushMaybeArray(log).call(log, value);
  return {
    a: Math,
    b: value
  };
};
export const effectful = (noisy(1), _Math$log10)(100);
const named = value => ({
  a: Object,
  b: value
});
{
  const Object = custom;
  use(_Object$fromEntries([]));
}
export const unknownArgument = noisy(src).b.hypot(3, 4);