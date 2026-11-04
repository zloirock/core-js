import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
// Method arity and parameter types survive the receiver capture.
export class Read {
  declare last?: number;
  set value({
    at
  }: number[]) {
    this.last = at.call([3, 5], -1);
  }
  async read({
    at
  }: number[]) {
    return at.call([7], await Promise.resolve(-1));
  }
}