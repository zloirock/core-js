// usage-pure static-FALLBACK (member name not a known static): the receiver-only swap leaves the
// computed `[key]` property in place, so its side effect re-runs there. the receiver replacement
// must prepend ONLY the receiver-portion of the effects (`o.push('R')`), dropping the trailing
// computed-key SE (`o.push('K')`), else the key SE evaluates twice (o would be ['R','K','K']).
const o = [];
export const r = (o.push('R'), Promise)[(o.push('K'), 'noSuchStatic')];
