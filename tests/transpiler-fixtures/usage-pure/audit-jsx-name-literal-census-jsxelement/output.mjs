import _Promise from "@core-js/pure/actual/promise";
function Ns({
  all,
  ...rest
} = _Promise) {
  return [all, rest];
}
export const elements = [<Ns:x y={1} />];