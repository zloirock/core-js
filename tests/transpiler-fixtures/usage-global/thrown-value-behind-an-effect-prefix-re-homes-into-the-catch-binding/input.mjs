// a container thrown into a local catch is re-homed under the catch binding as it stands past an effect prefix
// or a chain assignment, as a bare thrown container is, so a constructor written through that binding lands in
// the container and a static read back through it loads the written constructor's statics
const box = { C: Array };
try {
  throw (init(), box);
} catch (caught) {
  caught.C = Iterator;
}
export const copied = box.C.from([1]);
const holder = { C: Object };
let last;
try {
  throw (last = holder);
} catch (taken) {
  taken.C = Map;
}
export const grouped = holder.C.groupBy([1], item => item);
