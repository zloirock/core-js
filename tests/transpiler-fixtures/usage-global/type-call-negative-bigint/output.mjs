import "core-js/modules/es.array.at";
// Signed bigint constraints retain the literal argument type.
declare function read<T extends bigint>(value: T): T extends -1n ? number[] : string;
read(-1n).at(-1);