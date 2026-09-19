// `Map ||= X` and friends on a bare unbound global are slot writes: the name DEOPTS - the
// statement and every read stay verbatim on the live binding. the guard-shim idiom for a
// WHOLE global is usage-global's niche (its injection provides the real global); pure
// substitutes only what it is CERTAIN about. the debug note surfaces each deopted name
Map ||= {};
Map &&= {};
Map ??= {};