// `keyof T` privacy keys on the AST discriminator: a real `#priv` member is excluded per
// TS spec, while a PUBLIC member SPELLED '#weird' (string-literal key) is a normal key and
// must survive a NON-passthrough mapped expansion (the passthrough form substitutes to the
// source directly and never exercised the filter)
interface Src { '#weird': number[]; regular: string[]; }
type NonPass = { [K in keyof Src]: readonly Src[K][] };
declare const m: NonPass;
export const hashKey = (m['#weird'] as any).at(0);
export const plainKey = (m.regular as any).includes('s');

// an `as`-remapped keyof expansion applies the same AST-keyed privacy filter
type Remapped = { [K in keyof Src as K]: readonly Src[K][] };
declare const rm: Remapped;
export const remapped = (rm['#weird'] as any).at(2);

class WithPriv { #secret = 1; open = 2; }
type FromClass = { [K in keyof WithPriv]: number[] };
declare const c: FromClass;
export const survivor = (c.open as any).at(1);
