import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A selected call can replace the initial realm with a user object.
// The visible realm arm cannot justify substituting the user's static method.
function read(flag, factory) {
  let realm = globalThis;
  ({
    value: realm
  } = flag ? {
    value: globalThis
  } : factory());
  return [realm === globalThis, realm.Array.from([7])[0]];
}
const factory = () => ({
  value: {
    Array: {
      from: () => [9]
    }
  }
});
export const result = [read(true, factory), read(false, factory)];