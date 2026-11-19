import _keys from "@core-js/pure/actual/instance/keys";
// an instance reaches its class's statics through `constructor`: where the file reads that key, a class it
// constructs hands its statics on, so a constructor passed to one pairs with nothing and keeps the namespace
// its reads owe
class Kept {
  static keysOf(O, value) {
    return _keys(O).call(O, value);
  }
}
export const instance = new Kept();
export const owner = instance.constructor;
export const keys = Kept.keysOf(Object, {
  a: 1
});