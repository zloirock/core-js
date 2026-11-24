import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// Method arity and parameter types survive the receiver capture.
export class Read {
  declare last?: boolean;
  set value({
    includes
  }: number[]) {
    this.last = includes.call([3, 5], 5);
  }
  async read({
    at
  }: number[]) {
    return at.call([7], await Promise.resolve(-1));
  }
}