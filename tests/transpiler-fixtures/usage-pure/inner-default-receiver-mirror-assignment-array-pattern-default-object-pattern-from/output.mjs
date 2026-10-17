import _Array$from from "@core-js/pure/actual/array/from";
const pick = () => ({
  from: () => [7]
});
let assigned;
[{
  from: assigned
} = {
  from: _Array$from
}] = [pick()];
export { assigned };