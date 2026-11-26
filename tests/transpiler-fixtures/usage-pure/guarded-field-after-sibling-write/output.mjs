import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
type State = {
  kind: 'list';
  data: number[];
} | {
  kind: 'text';
  data: string;
};
export function read(state: State) {
  var _ref;
  if (state.kind !== 'list') return;
  let alias: State;
  _Reflect$set(alias = state, 'extra', 1);
  return _atMaybeArray(_ref = state.data).call(_ref, -1);
}