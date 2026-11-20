import _Array$from from "@core-js/pure/actual/array/from";
// A selected static runs arguments before rejecting a missing method.
export function read(receiver, argument) {
  const Ctor = receiver || Array;
  return _Array$from.call.call(Ctor === Array ? _Array$from : Ctor.from, Ctor, argument());
}