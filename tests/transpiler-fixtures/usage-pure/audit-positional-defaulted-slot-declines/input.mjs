// the ELEMENT routes bind the dispatch IN PLACE of the slot, so a DEFAULTED claim has no arm left to
// run - and the dispatch does not stand in for it: a receiver carrying no such method answers
// `undefined` where the source answers its own default. the pattern stays native there, and the
// relocation that would have hosted it stands down with it; the undefaulted twin below is served
const seen = [];
for (const [{ at: viaDefault = fb }] of [[{}]]) seen.push(viaDefault === fb);

for (const [{ at: viaPlain }] of [[[1, 2]]]) seen.push(typeof viaPlain);
export { seen };
