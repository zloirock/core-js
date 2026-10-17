import _Array$from from "@core-js/pure/actual/array/from";
const pick = () => ({
  from: () => [7]
});
const [{
  from: dynamicSibling
} = {
  from: _Array$from
}, count] = [pick(), 1];
export { dynamicSibling };
export { count };