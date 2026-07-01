// a parenthesized TUPLE object operand in a positional indexed access (`([number[], string])[0]`):
// indexed-access resolution peels the TSParenthesizedType once before the tuple-element lookup, so element 0
// is `number[]` and `.at` narrows to the array variant (the keyof-self paren path has its own fixture)
declare const obj: ([number[], string])[0];
obj.at(0);
