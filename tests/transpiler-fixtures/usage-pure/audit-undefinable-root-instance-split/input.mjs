// an instance dispatch reached through a `.call` read over a probe-holding root keeps the root's
// guard on both legs and reads the prototype off the folded ponyfill; the instance claim below the
// chain end owns the nav, so its split composes the root probe into its own test on both legs
// (`x == null`), and the hop-claim guard never spells it first
const probeAlias = globalThis.window;
export const probeInstance = probeAlias?.self?.Array.prototype.at.call([7], 0);
