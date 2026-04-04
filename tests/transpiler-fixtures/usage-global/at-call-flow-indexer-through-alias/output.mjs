import "core-js/modules/es.array.at";
type MyMap = {
  [key: string]: string[]
};
const m: MyMap = {};
m["key"].at(0);