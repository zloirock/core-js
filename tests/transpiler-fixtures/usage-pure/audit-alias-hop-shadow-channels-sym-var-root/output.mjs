import _Symbol from "@core-js/pure/actual/symbol/constructor";
// symbol fold where the shadow WINS (the var's init reads a block-local shadow) - no fold
const symVarRoot = _Symbol;