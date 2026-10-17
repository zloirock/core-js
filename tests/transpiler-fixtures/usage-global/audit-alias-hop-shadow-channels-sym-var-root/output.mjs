import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
// symbol fold where the shadow WINS (the var's init reads a block-local shadow) - no fold
const symVarRoot = Symbol;