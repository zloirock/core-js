import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.regexp.flags";
import "core-js/modules/es.string.at";
// Closed callers supply literal primitive receivers to their instance reads.
// Distinct methods keep Number, String and RegExp imports observable independently.
function number({
  toFixed
}) {
  return toFixed;
}
function text({
  at
}) {
  return at;
}
function expression({
  flags
}) {
  return flags;
}
export const numberMethod = number(1);
export const textMethod = text(`12`);
export const regexpFlags = expression(/x/g);