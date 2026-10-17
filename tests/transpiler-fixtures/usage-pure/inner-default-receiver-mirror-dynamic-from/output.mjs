import _Array$from from "@core-js/pure/actual/array/from";
const pick = () => ({
  from: () => [7]
});
const [{
  from: dynamicFrom
} = {
  from: _Array$from
}] = [pick()];
export { dynamicFrom };