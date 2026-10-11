// a call an open selection of containers is handed to that only reads the slot leaves it unwritten: whichever
// container the selection holds, a static read through the slot after the call is read as one through the
// selection itself, and the static a native owner lacks on the targets is served
const listed = flag ? { C: Array } : { C: Object };
function peek(target) {
  return target.C;
}
peek(listed);
export const copied = listed.C.from([1]);
const counted = flag ? { C: Number } : { C: Object };
function inspect(target) {
  return target.C;
}
inspect(counted);
export const { C: { isInteger } } = counted;
