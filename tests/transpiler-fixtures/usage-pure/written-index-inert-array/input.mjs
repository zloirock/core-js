// an array literal that holds no constructor is a container once the file writes one into a slot: a
// read off that slot reaches the written constructor, so usage-global injects for it and pure guards
// the pattern binding's read on it (the member read of a written slot stays native)
const list = [1];
list[0] = String;
export const viaMember = list[0].raw`x`;
const pair = [];
pair[0] = Object;
const { 0: O } = pair;
export const viaKeyed = O.groupBy([1], x => x);
