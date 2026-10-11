// in a `||` chain over fresh containers the first always yields: every later level is dead, and its
// constructor injects nothing, as in the chain over bare built-ins
export const { C: { groupBy } } = { C: Map } || { C: Object } || { C: Set };
export const settled = ({ C: Promise } || { C: Array } || { C: Number }).C.allSettled;
