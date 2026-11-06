import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An instance read beside object rest retains its native source and exclusions.
// The receiver call and computed key run once; rest, not call repeatability, prevents overwrite.
let method, rest;
({
  [(effect(), Symbol.iterator)]: method = fallback(),
  ...rest
} = getReceiver());