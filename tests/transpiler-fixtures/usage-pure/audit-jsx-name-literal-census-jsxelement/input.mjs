function Ns({ all, ...rest } = Promise) {
  return [all, rest];
}
export const elements = [<Ns:x y={1} />];
