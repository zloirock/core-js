// Branching container slots do not prove a single static receiver. An arm that is a native static
// owner guards the static it names against the captured slot, as a bare selecting alias guards it
// against the captured constructor; an arm pure swaps whole reads its own statics, and one naming
// no such static leaves the read native. Each row names a distinct method.
const c = typeof document == 'undefined';
// A bare alias exposes constructor candidates for an identity guard.
const aliasBase = c ? Object : Math;
export const viaBareAlias = aliasBase.clz32(1);
