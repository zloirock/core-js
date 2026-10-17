import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
const aliased = {
  O: Object,
  A: Array
};
let aliasBind, aliasFrom;
({
  O: {
    keys: {
      bind: aliasBind
    }
  },
  A: {
    from: aliasFrom
  }
} = {
  O: {
    keys: _Object$keys
  },
  A: {
    from: _Array$from
  }
});
export const unnamed = [typeof aliasBind, typeof aliasFrom];