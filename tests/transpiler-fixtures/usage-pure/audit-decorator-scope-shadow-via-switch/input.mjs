@(function () {
  switch (globalThis.mode) {
    case 1:
      let globalThis = 1;
      return globalThis;
    default:
      return 0;
  }
})
class ViaSwitch {}
export { ViaSwitch };
