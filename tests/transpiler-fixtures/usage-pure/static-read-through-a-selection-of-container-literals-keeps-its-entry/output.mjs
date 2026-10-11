import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a pattern reading a constructor's static through a selection of container literals reads it back off
// the binding pure puts in the slot - nothing extracts it - so that constructor's import carries its
// statics, whichever selection spells the choice
export const {
  C: {
    groupBy
  }
} = flag ? {
  C: _Map
} : user;
let attempt;
export const assign = () => ({
  C: {
    try: attempt
  }
} = flag ? {
  C: _Promise
} : user);
export const [{
  from: iterate
}] = flag ? [_Iterator] : [user.C];
export const {
  C: {
    canParse
  }
} = flag && {
  C: _URL
} || user;
export const {
  C: {
    for: named
  }
} = maybe ?? {
  C: _Symbol
};