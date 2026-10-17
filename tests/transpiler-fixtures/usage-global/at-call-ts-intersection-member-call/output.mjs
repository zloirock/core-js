import "core-js/modules/es.array.at";
interface HasItems {
  getItems(): string[];
}
interface HasName {
  name: string;
}
declare const obj: HasItems & HasName;
obj.getItems().at(0);