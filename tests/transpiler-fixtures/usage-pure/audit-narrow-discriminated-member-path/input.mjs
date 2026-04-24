// discriminated union narrowing on a member path (`obj.d`) - guard `obj.d.kind === 'a'`
// restricts the union to the `string[]` arm and `.at(0)` resolves as Array.at
type U = { kind: 'a', data: string[] } | { kind: 'b', data: number };
declare const obj: { d: U };
if (obj.d.kind === 'a') {
  globalThis.__r = obj.d.data.at(0);
}
