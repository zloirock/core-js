// per-prop removal ranges on the body-extract path, which a pattern reaches only when the caller-
// correct synth is impossible: replaying a DYNAMIC computed key would re-evaluate the key expression,
// and no literal can do that without a temporary. the retained key also breaks or joins the run of
// removed props, which is what decides whether two ranges share a comma. DECLARED non-exported fns
// with no escaping call site are safe to emit lossily; exported / escaping / overridden ones stay verbatim
// a leading RUN of two removed props: the second removal must consult the first so the shared comma
// is not double-consumed (partial-overlap crash)
function leadingRun({ from, of, [globalThis.pick]: z } = Array) { return [from, of, z]; }
leadingRun();
// the retained prop SEPARATES the removed ones, so each range is clean and they never overlap
function noncontiguous({ entries, [globalThis.pick]: z, keys } = Object) { return [entries, keys, z]; }
noncontiguous();
// a trailing RUN whose higher-indexed prop is LAST - the shared comma sits between the removed pair
function consecutiveTail({ [globalThis.pick]: z, values, fromEntries } = Object) { return [values, fromEntries, z]; }
consecutiveTail();
