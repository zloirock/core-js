import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array-buffer.constructor";
import "core-js/modules/es.array-buffer.detached";
import "core-js/modules/es.array-buffer.transfer";
import "core-js/modules/es.array-buffer.transfer-to-fixed-length";
import "core-js/modules/es.array-buffer.species";
import "core-js/modules/es.array-buffer.to-string-tag";
// Rest requires the constructor family only in flavors with a constructor entry.
const {
  isView,
  ...rest
} = ArrayBuffer;
export { isView, rest };