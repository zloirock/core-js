// A computed static leaf captures the guarded Object value first.
// An absent nav throws before the key effect; a defined nav runs the key effect
// before initializing the pure binding.

let f1 = 0;
export const { Object: { [(f1++, 'freeze')]: viaAnchoredSealedSeKey } } = (globalThis.window?.self);
export { f1 };
