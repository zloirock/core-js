// Writing a member of a getter result keeps the owner's getter installed.
// Each read returns a fresh array, so the later call needs only the array polyfill.
const inner = {
  get value() {
    return [3, 4];
  },
};
const box = { inner };
box.inner.value.at = 0;
consume(box.inner.value.at(-1));
