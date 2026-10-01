// An unknown write key may replace the constructor slot read by the nested pattern.
const dynamicWriteKey = (function (key) {
  const dynamic = { k: Object };
  dynamic[key] = Map;
  const { k: { groupBy } } = dynamic;
  return groupBy;
})('k');
export { dynamicWriteKey };
