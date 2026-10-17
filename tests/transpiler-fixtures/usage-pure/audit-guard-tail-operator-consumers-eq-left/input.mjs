// the guard on the LEFT of an operator is an operand too: the folded tail may not end the
// expression there either
export const eqLeft = globalThis.window?.self.Promise.resolve(1).constructor.length === 1;
