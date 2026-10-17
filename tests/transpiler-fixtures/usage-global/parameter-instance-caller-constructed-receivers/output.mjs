import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// Constructed caller receivers retain their own instance families.
// The String and Array reads use different shared methods so neither masks the other.
function text({
  at
}) {
  return at;
}
function list({
  includes
}) {
  return includes;
}
export const textMethod = text(new String('12'));
export const listMethod = list(new Array(1, 2));