// the deferred init SE drains at the host's slot: after every statement derived from
// preceding sources (including their inserted export extractions), before its own
// binding extraction
const m = mk();
export const { keys, custom } = m;
const { from } = (eff(), Array);
export const { all, rest } = (effA(), mkP());
use(from, keys, custom, all, rest);
