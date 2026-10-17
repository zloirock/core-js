function DeepMemberRoot({ keys, ...rest } = Object) {
  return [keys, rest];
}
export const elements = [<DeepMemberRoot.A.B x={1} />];
