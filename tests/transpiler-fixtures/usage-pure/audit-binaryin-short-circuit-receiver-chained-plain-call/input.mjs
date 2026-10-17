const words = ['ab', 'cd'];
export const chainedPlainCall = 'includes' in words.concat([]).slice();
