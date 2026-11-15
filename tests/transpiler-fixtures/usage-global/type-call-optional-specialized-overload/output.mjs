import "core-js/modules/es.array.at";
// A literal-typed optional parameter specializes its signature even when omitted.
declare function read(value: string): string;
declare function read(value: string, mode?: 'rows'): number[];
read('value').at(-1);