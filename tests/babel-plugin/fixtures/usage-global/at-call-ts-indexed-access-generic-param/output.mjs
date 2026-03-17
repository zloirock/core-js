import "core-js/modules/es.array.at";
type Container<T> = {
  items: T[];
};
type Items = Container<string>["items"];
const x: Items = [];
x.at(0);