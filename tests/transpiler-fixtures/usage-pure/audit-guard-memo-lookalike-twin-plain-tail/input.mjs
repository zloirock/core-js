// NEGATIVE: no polyfilled call in the argument, so nothing competes for the slot
export function plainTail(o) {
  return o.items?.at(o.items.length - 1);
}
