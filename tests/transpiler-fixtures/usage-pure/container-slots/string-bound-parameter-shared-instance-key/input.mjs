// A const-bound computed key reads the string-valued parameter default.
// Pure mirrors its typed helper into the default; supplied arguments retain their own properties.
const KEY = 'at';
export function read({ [KEY]: at } = 'abc') { return at; }
