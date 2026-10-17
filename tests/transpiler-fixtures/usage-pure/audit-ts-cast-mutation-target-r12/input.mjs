// A patched enum key cannot select its original static during destructuring.
enum PatPatched { OF = 'of' }
Object.assign(PatPatched, { OF: 'from' });
const { [PatPatched.OF]: fromPatchedKey } = Array;
export const r12 = typeof fromPatchedKey;
