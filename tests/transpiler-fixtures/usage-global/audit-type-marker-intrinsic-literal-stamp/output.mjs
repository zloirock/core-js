import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// the intrinsic string transformers are computable on a literal argument and TS keeps the
// result a LITERAL type, so a conditional that discriminates on it takes the TRUE branch.
// a dropped stamp reads as wide-vs-narrow and answers with the other family entirely
type Upper = Uppercase<'a'> extends 'A' ? number[] : string;
type Lower = Lowercase<'A'> extends 'zz' ? number[] : string;
declare const upper: Upper;
declare const lower: Lower;
upper.at(0);
lower.includes('a');