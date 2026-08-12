import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Pattern nesting past the retired 32-hop budget is legal source that generated code reaches, so both
// climbs over it answer from the TREE. The param-position climb used to THROW `pattern nesting exceeds 32
// levels` and abort the build; the write-target climb used to answer a silent `false`, which drops the
// usage-global rescue of a global written through a destructure leaf. usage-pure leaves that leaf raw by
// design - a frozen import cannot be written - so it is the negative control here.
export function deepParam([[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[{
  from
} = Array]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]) {
  return from([1]);
}
var arr;
[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Promise]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]] = arr;