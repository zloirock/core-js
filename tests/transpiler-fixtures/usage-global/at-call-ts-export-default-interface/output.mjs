import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
export default interface Data {
  items: string[];
  counts: number[];
}
function foo(d: Data) {
  // resolveUserDefinedType -> getTypeMembers: member access
  d.items.at(-1).padEnd(5);
  // resolveUserDefinedType -> getTypeMembers: destructuring
  const {
    counts
  } = d;
  counts.at(-1).toFixed(2);
}