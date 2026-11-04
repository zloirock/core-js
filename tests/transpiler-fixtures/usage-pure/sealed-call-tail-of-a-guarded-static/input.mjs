// The sealed optional invocation guards its argument and retains the static method as the receiver of call.
export const value = (globalThis.window?.Array.of.call)?.(null, argument());
