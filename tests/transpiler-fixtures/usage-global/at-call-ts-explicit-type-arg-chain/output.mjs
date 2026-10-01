import "core-js/modules/es.array.find";
import "core-js/modules/es.string.includes";
function create<T>(): T[] {
  return [];
}
create<string>().find(Boolean).includes('x');