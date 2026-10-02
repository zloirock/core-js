// A proven inherited toString returns a string; value and call queries keep independent caches.
const box = {
  run() {
    const result = this.toString().at(-1);
    void this.toString.at;
    return result;
  }
};
use(box.run());
