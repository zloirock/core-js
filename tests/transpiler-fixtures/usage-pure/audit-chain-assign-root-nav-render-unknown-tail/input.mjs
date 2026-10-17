// the same shapes over a tail name this file never writes: the detector knows nothing about it,
// which is exactly the case the suppressed hop used to swallow
let heldUnknown;
export const unknownTail = (heldUnknown = globalThis)?.window?.self.unknownBox.list?.at(0);
export { heldUnknown };
