import "core-js/modules/es.reflect.set";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
enum Key {
  First
}
Reflect.set(Key, 0, [7]);
export const first = Key[Key.First].at(0);
namespace Namespace {
  export enum Status {
    Ready
  }
}
const {
  Status: saved
} = Namespace;
Reflect.set(saved, 0, ['updated']);
export const selected = Namespace.Status[0].includes('updated');