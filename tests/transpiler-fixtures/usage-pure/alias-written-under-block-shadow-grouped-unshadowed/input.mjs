let unshadowed;
{
  unshadowed = Map;
}
export const groupedUnshadowed = () => unshadowed.groupBy([1, 2], it => it % 2);
