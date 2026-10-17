function NsAttr({ race, ...rest } = Promise) {
  return [race, rest];
}
export const elements = [<Other z:NsAttr={1} />];
