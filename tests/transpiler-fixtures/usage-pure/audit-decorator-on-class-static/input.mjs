// Decorator wrapping a class with static method using a polyfilled API. babel emits
// Decorator wrapper around expression; oxc emits same shape but visitor keys differ.
// Test that decorators don't shield the inner Array.from from polyfill detection
function dec(target: any) { return target; }

@dec
class Holder {
  static load() {
    return Array.from([1, 2, 3]).at(0);
  }
}
new Holder();
