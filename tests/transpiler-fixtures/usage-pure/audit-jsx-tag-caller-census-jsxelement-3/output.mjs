function MemberRoot({
  entries,
  ...rest
} = Object) {
  return [entries, rest];
}
export const elements = [<MemberRoot.Sub x={1} />];