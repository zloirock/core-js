import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
namespace App {
  export enum State {
    Ready
  }
}
const {
  State: saved
} = App;
export const before = App.State[0].at(0);
if (flag) Reflect.set(saved, 0, ['written']);
export const after = App.State[0].includes('written');