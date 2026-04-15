import _Array$from from "@core-js/pure/actual/array/from";
// init has a call inside a composite literal — must be treated as side-effectful
const {
  from
} = {
  get from() {
    log();
    return _Array$from;
  }
};