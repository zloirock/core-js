import _Promise from "@core-js/pure/actual/promise";
function NsAttr({
  race,
  ...rest
} = _Promise) {
  return [race, rest];
}
export const elements = [<Other z:NsAttr={1} />];