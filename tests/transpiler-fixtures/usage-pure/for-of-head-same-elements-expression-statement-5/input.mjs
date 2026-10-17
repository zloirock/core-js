// ... and ahead of the STATICS the host extracted earlier: the source ran the element first
const known = { w: Object, y: [1] };
const [{ w: { is: viaEmptiedStatic }, y: { at: viaEmptiedStaticAt } }] = [known, log.push('s')];
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedStatic };
