import "core-js/modules/es.array.at";
type WithId = {
  id: number;
};
type WithItems = {
  items: string[];
};
type Combined = WithId & WithItems;
declare const obj: Combined;
obj.items.at(0);