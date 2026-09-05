// a declarator drained through the whole-init MEMO route can carry ordinary claims of its own: they
// drain there too, reading the ref that route declared. skipping them dropped the extraction outright
// and left the binding UNDECLARED, which an export then referenced - output that does not parse
const log = [];
const arr = [3, [1, 2]];
const eff = () => { log.push('e'); return arr; };
const { [(log.push('k'), 'at')]: viaSeKey, flat: viaSibling } = eff();
const { [(log.push('k2'), 'at')]: viaCallRecv, flat: viaCallSibling } = eff().slice();
// ... and the same pair on an EXPORTED host, where the undeclared name was a parse error
export const { [(log.push('k3'), 'at')]: viaExported, flat: viaExportedSibling } = eff();
// ... while a lone SE-key claim and a pair without one already agreed
const { [(log.push('k4'), 'at')]: viaLoneSeKey } = eff();
const { at: viaPlainPair, flat: viaPlainSibling } = eff();
export { viaSeKey, viaSibling, viaCallRecv, viaCallSibling, viaLoneSeKey, viaPlainPair, viaPlainSibling, log };
