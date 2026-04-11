import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const a = b;
const b = a;
const obj = {
  [a]: 'hello'
};
obj[a].at(0);