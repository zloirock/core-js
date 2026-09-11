interface StringList extends Array<string> {}
const list: StringList = [];
for (const item of list) {
  item.at(0);
}
