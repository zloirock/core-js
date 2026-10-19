import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a state shape read through `typeof` takes the type each property is asserted with, not the value it
// starts with: a query typed `string | string[]` may hold either family, the asserted ids stay arrays
const initialState = {
  query: '' as string | string[],
  ids: [] as number[]
};
type State = typeof initialState;
export function matches(state: State, term: string) {
  var _ref;
  return _includes(_ref = state.query).call(_ref, term);
}
export function lastId(state: State) {
  var _ref2;
  return _atMaybeArray(_ref2 = state.ids).call(_ref2, -1);
}