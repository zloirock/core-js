// A proven inherited toString returns a string; value and call queries keep independent caches.
const box = {
  run() {
    void this.toString.at;
    const result = this.toString().at(-1);
    return result;
  }
};
use(box.run());
