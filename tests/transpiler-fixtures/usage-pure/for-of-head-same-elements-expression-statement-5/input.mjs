// A known literal container keeps its native Object.is read beside an instance at capture.
// The trailing array effect runs before either property binds.
const known = { w: Object, y: [1] };
const [{ w: { is: viaEmptiedStatic }, y: { at: viaEmptiedStaticAt } }] = [known, log.push('s')];
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedStatic };
