// a `||` / `??` left reading a static container's slot that holds a constructor never runs its right: the
// right arm's static is not injected, in a declaration, an assignment and a member read alike. a slot a write
// may reach keeps the selection, and its right arm's static stays
const box = { U: Map, I: Iterator, T: Int8Array };
const held = { M: Map };
if (globalThis.reset) held.M = null;
export const { groupBy } = box.U || Object;
export let from;
({ from } = box.I ?? Array);
export const viaMember = (box.T || Array).of;
export const { fromEntries } = held.M || Object;
