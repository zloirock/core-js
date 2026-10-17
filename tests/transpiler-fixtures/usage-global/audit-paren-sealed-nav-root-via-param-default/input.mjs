// the same shape as a parameter default renders identically
export function viaParamDefault(x = (globalThis.window?.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(2)) {
  return x;
}
