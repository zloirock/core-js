import "core-js/modules/es.object.assign";
// The value copied from a getter by Object.assign replaces the initializer's constructor.
// Retain the supplied custom method rather than substituting a native static.
const box = {
  value: Array
};
Object.assign(box, {
  get value() {
    return {
      from: () => 'custom'
    };
  }
});
function read(held) {
  return held.from([1]);
}
read(box.value);