// a full-consume extraction discards the read the source performs, so an UNDEFINABLE probe nav as
// its init re-emits that read as a THROW probe off the guard value: the single-property extraction
// throws exactly where native does. a member read, an object read and an array pattern over the same
// nav keep their guards.
export const { trunc } = globalThis.window?.self.Math;
export const signRead = globalThis.window?.self.Math.sign;
export const mathRead = globalThis.window?.self.Math;
export const [firstOf] = globalThis.window?.self.Array.of(1);
