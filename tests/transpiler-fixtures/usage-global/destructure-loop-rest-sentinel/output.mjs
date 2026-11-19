import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Static rest exclusions in both loop slots declare their sentinels outside the header.
let from,
  rest,
  index = 0;
for ({
  from,
  ...rest
} = Array; index < 2; index++, {
  from,
  ...rest
} = Array) {
  use(from([index]), rest);
}