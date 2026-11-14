import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  var _ref;
  const effects = [];
  const obj = {
    k: 1
  };
  const result = (_ref = choice ? Object : null, null == _ref ? true : delete (_ref === Object ? _Object$fromEntries([["k", obj]]) : _ref.fromEntries([["k", obj]])).k.k);
  return [result, "k" in obj];
}