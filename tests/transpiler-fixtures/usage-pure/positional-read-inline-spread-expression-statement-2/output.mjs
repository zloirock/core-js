import _Set from "@core-js/pure/actual/set/constructor";
const [, {
  Set: ViaProxyShifted
}] = [...[0, {
  Set: _Set
}]];
new ViaProxyShifted();