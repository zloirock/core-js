import _Promise from "@core-js/pure/actual/promise";
// An effectful write supplies the latest container and runs its prefix once.
// The native allSettled read uses the full stored Promise constructor.
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = {
  d: Object
};
rw9 = (eff9(), {
  d: _Promise
});
const {
  d: {
    allSettled: viaSeWrite
  }
} = rw9;
export { viaSeWrite };