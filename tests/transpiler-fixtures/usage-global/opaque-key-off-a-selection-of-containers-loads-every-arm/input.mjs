// a key nothing names read off a selection of containers spelled in place may read any static of the constructor
// each arm's slot holds: every arm's constructor statics are injected, the Map arm's and the Object arm's alike
const { C: { [key()]: fromArm } } = c ? { C: Map } : { C: Object };
export { fromArm };
