import _globalThis from "@core-js/pure/actual/global-this";
@(function () {
  switch (_globalThis.mode) {
    case 1:
      let globalThis = 1;
      return globalThis;
    default:
      return 0;
  }
})
class ViaSwitch {}
export { ViaSwitch };