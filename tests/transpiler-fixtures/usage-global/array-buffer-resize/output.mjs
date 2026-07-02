import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array-buffer.constructor";
import "core-js/modules/es.array-buffer.detached";
import "core-js/modules/es.array-buffer.transfer";
import "core-js/modules/es.array-buffer.transfer-to-fixed-length";
import "core-js/modules/es.array-buffer.species";
import "core-js/modules/es.array-buffer.to-string-tag";
new ArrayBuffer(8, {
  maxByteLength: 1024
}).resize(16);