import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A receiver assertion supplies the String family for an otherwise unknown value.
// Parameter defaults and IIFE arguments retain that annotation at the extraction site.
function f({
  at
} = x as string) {
  return at;
}
const g = (({
  includes
}) => includes)(y as string);
export { f, g };