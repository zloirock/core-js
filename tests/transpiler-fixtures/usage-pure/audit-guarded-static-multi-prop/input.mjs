// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// a binding that MAY be a constructor takes the identity guard, and a pattern reading several of its
// statics splits into one read per prop, in source order - each with its own guard. a prop this plan
// cannot answer stays in the ORIGINAL pattern node (a spliced one would depend on a later visit, which
// only one leg makes), and only the claims at the pattern's EDGE detach, so source order holds
let M = globalThis.Array;
if (!M) M = Array;
const { from, of } = M;
// ... the claim's own position in the pattern decides nothing - the reads keep source order
const { of: of2, from: from2 } = M;
// a plain data key stays in the pattern, the claims ahead of it detach
const { from: from3, of: of3, isArray } = M;
const { from: from4, ...rest } = M;
// a DEFAULT belongs to its own canon and a COMPUTED key would be printed twice: both stay, the claim
// at the edge detaches
const { from: from5, of: of5 = 1 } = M;
const dyn = 'of';
const { from: from6, [dyn]: of6 } = M;
// the ASSIGNMENT host splits too, where its value is nobody's - a statement of its own
let a, b;
({ from: a, of: b } = M);
export { from, of, of2, from2, from3, of3, isArray, from4, rest, from5, of5, from6, of6, a, b };
