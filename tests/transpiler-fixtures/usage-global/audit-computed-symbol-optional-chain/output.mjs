import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// computed key with optional access on `Symbol?.iterator`: the well-known symbol must
// still be recognised through the optional access form.
const obj = {};
obj[Symbol?.iterator];