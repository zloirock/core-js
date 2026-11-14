import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  var _ref;
  const effects = [];
  const obj = {
    k: 1
  };
  const result = delete ((_ref = choice ? Object : null, null == _ref ? void 0 : _ref === Object ? _Object$fromEntries([["k", obj]]) : _ref.fromEntries([["k", obj]])) as any).k.k;
  return [result, "k" in obj];
}