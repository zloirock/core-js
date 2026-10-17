// probe-carrying synth reaches the remaining HOSTS through their own visitors: a for-init
// extracted binding and a class-field IIFE param default (SE-key rides the probe once)
let c6 = 0;
class SealedHost {
  field = (({ is: fv } = (globalThis.window?.[(c6++, 'self')]).Object) => fv)();
}
export const sealedHost = new SealedHost();
export { c6 };
