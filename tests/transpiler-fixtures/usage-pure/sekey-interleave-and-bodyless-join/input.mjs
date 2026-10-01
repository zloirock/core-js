// Instance reads preserve receiver, key and default order across host forms.
const log = [];
const k = tag => (log.push(tag), tag);
const { [k('at')]: viaSeq, [k('flat')]: viaSeqFlat, z } = eff(), viaSeqTail = 1;
const { [k('at')]: viaIdent, [k('flat')]: viaIdentFlat, y } = arr;
export const { [k('at')]: viaExport, [k('flat')]: viaExportFlat, w } = eff();
const { [k('at')]: viaRest, [k('flat')]: viaRestFlat, ...viaRestRest } = arr;
if (c) var { [k('at')]: viaBodyless, bz } = eff(), viaBodylessTail = 2;
if (c) var { [k('at')]: viaBodylessSole, bs } = eff();
if (c) var viaBodylessLead = 3, { [k('at')]: viaBodylessBehind } = eff();
if (c) var { at: viaBodylessRest, ...viaBodylessRestRest } = eff(), viaBodylessRestTail = 4;
if (c) var { [k('at')]: viaBodylessSeg, [k('flat')]: viaBodylessSegFlat, bq } = eff(), viaBodylessSegTail = 5;
export { viaSeq, viaSeqFlat, z, viaSeqTail, viaIdent, viaIdentFlat, y, viaRest, viaRestFlat, viaRestRest, log };
export { viaBodyless, bz, viaBodylessTail, viaBodylessSole, bs, viaBodylessLead, viaBodylessBehind };
export { viaBodylessRest, viaBodylessRestRest, viaBodylessRestTail, viaBodylessSeg, viaBodylessSegFlat, bq, viaBodylessSegTail };
