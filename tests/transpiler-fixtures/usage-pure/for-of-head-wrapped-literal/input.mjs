// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
let n = 0;
const e = t => { n += t.length; return Object; };
const out = [];
for (const { w: { values: viaParenHead } } of ([{ w: Object }])) out.push(viaParenHead);
for (const { w: { entries: viaDoubleParenHead } } of (([{ w: Object }]))) out.push(viaDoubleParenHead);
for (const { w: { keys: viaAsConst } } of ([{ w: Object }] as const)) out.push(viaAsConst);
for (const item of ([{ w: Object }])) {
  const { is: viaParenAlias } = item.w;
  out.push(viaParenAlias);
}
for (const { w: { getOwnPropertyDescriptor: viaNonNull } } of ([{ w: Object }]!)) out.push(viaNonNull);
for (const { w: { getOwnPropertyDescriptors: viaSatisfies } } of ([{ w: Object }] satisfies unknown)) out.push(viaSatisfies);
for (const item of ([{ w: Object }] as any)) {
  const viaAsAnyMember = item.w.fromEntries;
  out.push(viaAsAnyMember);
}
for (const { w: { getOwnPropertyNames: viaParenCallee } } of [{ w: (e)('a') }, { w: e('b') }]) out.push(viaParenCallee);
export { out, n };
