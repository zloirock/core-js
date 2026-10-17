import "core-js/modules/es.object.entries";
// NEGATIVE: an escaped container records no written values - only the literal candidate injects
const ce = {
  e: Object
};
export function sink(x) {
  return x;
}
sink(ce);
const {
  e: {
    entries: escapedLiteralOnly
  }
} = ce;
export { escapedLiteralOnly };