import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Set from "@core-js/pure/actual/set/constructor";
// a binding whose value may be a KNOWN CONSTRUCTOR is clouded - a head over elements that disagree:
// the guard channel owns its STATIC surface, because which object it holds decides which statics
// exist. an INSTANCE claim asks nothing of that - it takes the ordinary dispatch, the same one the
// member spelling of the read takes: every element is a function, so `name` dispatches as one and
// `at`, which no function carries, stays native
const seen = [];
for (const ctor of [Array, _Set]) {
  const name = _nameMaybeFunction(ctor);
  const {
    at
  } = ctor;
  _pushMaybeArray(seen).call(seen, name, typeof at);
}
// the STATIC surface of the same binding stays with the guard: it picks the ponyfill on the
// iteration where the value IS the constructor, and reads the slot on any other
for (const ctor of [Array, _Set]) {
  const from = ctor === Array ? _Array$from : ctor.from;
  _pushMaybeArray(seen).call(seen, typeof from);
}
// both spellings of one read agree - the member form was never gated on the binding's cloud
for (const ctor of [Array, _Set]) {
  _pushMaybeArray(seen).call(seen, _nameMaybeFunction(ctor), typeof (ctor === Array ? _Array$from : ctor.from));
}
export { seen };