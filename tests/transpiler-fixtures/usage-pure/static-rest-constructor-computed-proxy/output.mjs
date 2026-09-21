import _Promise from "@core-js/pure/actual/promise";
// A folded proxy key keeps its effect while constructor rest requires the full family.
export function read({
  all,
  ...rest
} = (hit(), _Promise)) {
  return [all, rest];
}