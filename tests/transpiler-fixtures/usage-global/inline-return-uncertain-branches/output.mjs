import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Every free constructor returned on a possible path contributes its used static.
// Mixed values and implicit undefined keep the original receiver and control flow.
// Only the call results leave the file; the returned namespaces stay local to their static reads.
export const mixed = (() => {
  if (flag) return Array;
  return custom;
})().of(3);
export const absent = (() => {
  if (flag) return Object;
})()?.groupBy([1, 2], value => value % 2);