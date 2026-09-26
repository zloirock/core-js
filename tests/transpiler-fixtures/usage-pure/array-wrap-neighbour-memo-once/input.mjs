// A surviving array element shares its receiver with the extraction.
// A member or selection needs one memo; a stable binding can be read again.
const [{ at: viaGetter }, keepA] = [holder.inner, 1];
const [{ at: viaSelection }, keepB] = [cond ? left : right, 2];
const [{ at: viaBinding }, keepC] = [arr, 3];
export { viaGetter, keepA, viaSelection, keepB, viaBinding, keepC };
