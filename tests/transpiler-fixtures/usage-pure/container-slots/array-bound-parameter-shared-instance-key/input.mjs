// A const-bound computed key reads the array-valued parameter default.
// Pure reads the actual receiver; supplied arguments retain their own methods.
const KEY = 'at';
export function read({ [KEY]: at } = [1, 2]) { return at; }
