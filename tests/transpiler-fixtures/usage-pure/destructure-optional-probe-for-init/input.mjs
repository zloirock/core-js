// The loop header's probe already owns the initializer's key effect.
const log = [];
let result;
for (const { of } = globalThis.window?.[(log.push([7].at(0)), 'Array')];;) {
  result = of(3);
  break;
}
export { result, log };
