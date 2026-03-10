import "core-js/modules/es.array.at";
const other = {
  x: 1
};
const obj = {
  ...other,
  items: [1, 2, 3]
};
obj.items.at(-1);