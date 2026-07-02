import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// the IIFE caller-arg consult precedes the wrapper-default shape gate: a CLASSIFIABLE live
// arg takes the synth (polyfill-wins) even when the default is not receiver-shaped. an
// UNCLASSIFIABLE arg does not preempt - the wrapper default owns the undefined-arg path, so
// the synth rides the default slot: the live arg destructures natively (caller value wins)
// while the no-arg / undefined-arg call still gets the polyfill
const a = (({
  from
} = []) => from([1]))({
  from: _Array$from
});
const b = (({
  of
} = {
  of: _Array$of
}) => of(2))(someVar);