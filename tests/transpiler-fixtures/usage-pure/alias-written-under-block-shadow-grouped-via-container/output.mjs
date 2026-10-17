import _Object$groupBy from "@core-js/pure/actual/object/group-by";
let box;
{
  const Map = Object;
  box = {
    M: Map
  };
}
export const groupedViaContainer = () => _Object$groupBy([1, 2], it => it % 2);