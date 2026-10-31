// Branching container slots do not prove a single static receiver. An arm that is a native static
// owner guards the static it names against the captured slot, as a bare selecting alias guards it
// against the captured constructor; an arm pure swaps whole reads its own statics, and one naming
// no such static leaves the read native. Each row names a distinct method.
const c = typeof document == 'undefined';
// branching OVER the container
const overContainer = c ? { Base: Object } : { Base: Promise };
export const viaContainer = overContainer.Base.withResolvers();
