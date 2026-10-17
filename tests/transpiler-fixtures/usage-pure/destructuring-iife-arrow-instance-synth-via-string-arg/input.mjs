// the receiver typing follows the argument's family; nested IIFEs register independently
export const viaStringArg = (({ at: atStr }) => atStr)("abc");
