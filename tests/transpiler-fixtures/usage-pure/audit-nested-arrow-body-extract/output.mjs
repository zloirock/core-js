import _Array$from from "@core-js/pure/actual/array/from";
// The known caller supplies the outer parameter's static method through an argument mirror.
// Both arrow bodies retain their source shape and share the same parameter binding.
const make = ({
  from
}) => () => from([1, 2]);
make({
  from: _Array$from
})();