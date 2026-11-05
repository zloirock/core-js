import _Array$from from "@core-js/pure/actual/array/from";
// A defined keyed slot makes its Array receiver default dead.
// The supported from extraction still uses the selected slot's constructor.
const {
  k: {
    from: keyedFrom
  } = {
    from: _Array$from
  }
} = {
  k: Array
};
export { keyedFrom };