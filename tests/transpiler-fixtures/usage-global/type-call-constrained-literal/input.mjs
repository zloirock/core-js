// A constrained type parameter keeps a const alias's literal value.
declare function read<T extends 'lines' | 'text'>(mode: T): T extends 'lines' ? number[] : string;
const mode = 'lines';
read(mode).at(-1);
