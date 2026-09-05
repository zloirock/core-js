// SEVERAL SE keys on one pattern interleave on both legs: native runs key, read, key, read - and the
// dispatch reads the property too - so each claim's extraction follows its own key's segment of
// the residual, the trailing plain props taking a segment of their own (memo declarator, identifier
// init and an exported host alike); a REST keeps the batch - no segment may gather the claimed keys
const log = [];
const k = tag => (log.push(tag), tag);
const { [k('at')]: viaSeq, [k('flat')]: viaSeqFlat, z } = eff(), viaSeqTail = 1;
const { [k('at')]: viaIdent, [k('flat')]: viaIdentFlat, y } = arr;
export const { [k('at')]: viaExport, [k('flat')]: viaExportFlat, w } = eff();
const { [k('at')]: viaRest, [k('flat')]: viaRestFlat, ...viaRestRest } = arr;
// a bodyless `var` host joins the sentinel memo into its one statement, the memo the leading
// declarator (a sole declarator and a sibling host alike); where the residual holds the sentinel
// alone the memo is a `const` statement and the slot braces; a rest-kept residual splits behind
// its extraction; a segment interleaves inside the join too
if (c) var { [k('at')]: viaBodyless, bz } = eff(), viaBodylessTail = 2;
if (c) var { [k('at')]: viaBodylessSole, bs } = eff();
if (c) var viaBodylessLead = 3, { [k('at')]: viaBodylessBehind } = eff();
if (c) var { at: viaBodylessRest, ...viaBodylessRestRest } = eff(), viaBodylessRestTail = 4;
if (c) var { [k('at')]: viaBodylessSeg, [k('flat')]: viaBodylessSegFlat, bq } = eff(), viaBodylessSegTail = 5;
export { viaSeq, viaSeqFlat, z, viaSeqTail, viaIdent, viaIdentFlat, y, viaRest, viaRestFlat, viaRestRest, log };
export { viaBodyless, bz, viaBodylessTail, viaBodylessSole, bs, viaBodylessLead, viaBodylessBehind };
export { viaBodylessRest, viaBodylessRestRest, viaBodylessRestTail, viaBodylessSeg, viaBodylessSegFlat, bq, viaBodylessSegTail };
