import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// a state shape read through `typeof` takes the type each property is asserted with, not the value it
// starts with: a query typed `string | string[]` may hold either family, the asserted ids stay arrays
const initialState = {
  query: '' as string | string[],
  ids: [] as number[]
};
type State = typeof initialState;
export function matches(state: State, term: string) {
  return state.query.includes(term);
}
export function lastId(state: State) {
  return state.ids.at(-1);
}