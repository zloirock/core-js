// An early call reads the hoisted key before its initializer; a later call reads "at".
// Folding the member key must not replace the first receiver slot with the second.
const receiver = {
  at: () => 7,
  undefined: () => 11
};
const early = read(receiver);
var key = 'at';
function read(value) {
  return value[key]();
}
export const result = [early, read(receiver)];