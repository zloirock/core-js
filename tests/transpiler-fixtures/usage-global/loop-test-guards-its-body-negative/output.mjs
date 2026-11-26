import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
declare function next(): string | string[];
export function arrays(list: string | string[]) {
  while (typeof list !== 'string') {
    list.find(Boolean);
    list.at(0);
    list = next();
  }
}