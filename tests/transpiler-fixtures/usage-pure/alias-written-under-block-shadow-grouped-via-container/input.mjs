let box;
{
  const Map = Object;
  box = { M: Map };
}
export const groupedViaContainer = () => box.M.groupBy([1, 2], it => it % 2);
