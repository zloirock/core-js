function PairedTag({ of, ...rest } = Array) {
  return [of, rest];
}
export const elements = [<PairedTag x={1}></PairedTag>];
