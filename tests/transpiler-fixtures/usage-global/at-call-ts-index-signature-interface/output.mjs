import "core-js/modules/es.string.at";
interface Dict {
  [key: string]: string;
}
const dict: Dict = {};
dict.foo.at(0);