// a holder installed as a PROTOTYPE stays reachable through every object whose chain runs through it
// (`Object.getPrototypeOf(target).items = ...`), so even a holder without methods keeps no field narrow
// there - through either `setPrototypeOf`
export function viaObject(target) {
  const proto = { items: [1, 2] };
  Object.setPrototypeOf(target, proto);
  return proto.items.at(0);
}
export function viaReflect(target) {
  const proto = { items: [1, 2] };
  Reflect.setPrototypeOf(target, proto);
  return proto.items.includes(1);
}
