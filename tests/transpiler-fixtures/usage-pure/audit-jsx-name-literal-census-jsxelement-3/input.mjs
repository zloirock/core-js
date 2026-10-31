function Referenced({ from, ...rest } = Array) {
  return [from, rest];
}
export const elements = [<Referenced x={1} />];
