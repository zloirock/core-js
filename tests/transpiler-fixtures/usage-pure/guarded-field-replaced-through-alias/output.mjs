import _at from "@core-js/pure/actual/instance/at";
type State = {
  kind: 'list';
  data: number[];
} | {
  kind: 'text';
  data: string;
};
export function read(state: State, write: boolean) {
  var _ref;
  if (state.kind !== 'list') return;
  const alias: {
    data: string | number[];
  } = state;
  if (write) alias.data = 'xy';
  return _at(_ref = state.data).call(_ref, -1);
}