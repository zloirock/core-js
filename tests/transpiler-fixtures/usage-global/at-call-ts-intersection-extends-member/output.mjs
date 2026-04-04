import "core-js/modules/es.array.at";
interface Base {
  items: string[];
}
interface Extended extends Base {
  id: number;
}
declare const obj: Extended & {
  extra: boolean;
};
obj.items.at(0);