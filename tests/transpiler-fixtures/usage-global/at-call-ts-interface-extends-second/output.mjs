import "core-js/modules/es.array.at";
interface Mixin {
  id: number;
}
interface MyArray extends Mixin, Array<string> {}
const arr: MyArray = [] as any;
arr.at(0);