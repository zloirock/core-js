import "core-js/modules/es.array.at";
declare var obj: {
  id: number
} & {
  items: Array<string>
};
obj.items.at(0);