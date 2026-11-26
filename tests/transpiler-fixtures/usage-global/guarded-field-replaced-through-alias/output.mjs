import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type State = {
  kind: 'list';
  data: number[];
} | {
  kind: 'text';
  data: string;
};
export function read(state: State, write: boolean) {
  if (state.kind !== 'list') return;
  const alias: {
    data: string | number[];
  } = state;
  if (write) alias.data = 'xy';
  return state.data.at(-1);
}