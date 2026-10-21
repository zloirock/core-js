// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
const known = { w: Object, y: [1] };
const [{ w: { is: viaEmptiedStatic }, y: { at: viaEmptiedStaticAt } }] = [known, log.push('s')];
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedStatic };
