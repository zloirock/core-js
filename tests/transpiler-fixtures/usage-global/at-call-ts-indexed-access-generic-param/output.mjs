import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
type Container<T> = {
  items: T[];
};
type Items = Container<string>["items"];
declare const x: Items;
x.at(0);
x[0].includes("a");