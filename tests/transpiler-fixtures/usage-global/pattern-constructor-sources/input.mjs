function registry() {
  const Collection = Map;
  return { Collection };
}
const { Collection: { groupBy } } = registry();
function valuesOf(input) {
  const { methods: { values } } = input;
  return values({ answer: 7 });
}
export const result = [groupBy([3], String).get('3'), valuesOf({ methods: Object })];
