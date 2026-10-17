// pattern-nested write targets: array element with a cast, defaulted element, and a
// paren-wrapped property value each rebind the slot through their own pattern branch
const h: number[] = [13];
for ([(h as any).find] of fns) {
  h.find(Boolean);
}
