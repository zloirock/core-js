import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// The SPELLING of `Symbol` is the canon's question, not this render's: a capitalised const alias and a proxy-global access name
// the same global, so they re-key like the bare name - read as a bare Identifier only, they leaked raw `Symbol` text into the
// residual.
const Sym = _Symbol;
const _ref = {
  Map: _Map,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
const aliased = _getIteratorMethod(_ref.Map);
const {
  Object: {
    fromEntries: fe6
  }
} = _ref;
aliased;