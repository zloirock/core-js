interface BaseList extends Array<string> {}
interface DerivedList extends BaseList {}
const list: DerivedList = [];
for (const item of list) {
  item.at(0);
}
