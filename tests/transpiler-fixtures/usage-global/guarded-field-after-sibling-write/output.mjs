import "core-js/modules/es.reflect.set";
import "core-js/modules/es.array.at";
type State = {
  kind: 'list';
  data: number[];
} | {
  kind: 'text';
  data: string;
};
export function read(state: State) {
  if (state.kind !== 'list') return;
  let alias: State;
  Reflect.set(alias = state, 'extra', 1);
  return state.data.at(-1);
}