import "core-js/modules/es.object.get-own-property-names";
// A hoisted container initialized on only one branch keeps the read of its runtime slot.
export function escapingContainer(cond) {
  if (cond) {
    var late = {
      k: Object
    };
  }
  return late.k.getOwnPropertyNames({});
}