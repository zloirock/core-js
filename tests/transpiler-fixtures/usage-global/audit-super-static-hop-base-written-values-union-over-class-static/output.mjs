import "core-js/modules/es.object.has-own";
class Slot0 {
  static Base = Boolean;
}
class Slot1 {
  static Base = Object;
}
let slotNs = Slot0;
if (c) slotNs = Slot1;
class OverClassStatic extends slotNs.Base {
  static go() {
    return super.hasOwn({}, 'a');
  }
}
export { OverClassStatic };