// An explicit string annotation widens the argument before generic inference.
declare function read<T extends string>(value: T): T extends 'abc' ? number[] : string;
const value: string = 'abc';
read(value).includes('bc');
