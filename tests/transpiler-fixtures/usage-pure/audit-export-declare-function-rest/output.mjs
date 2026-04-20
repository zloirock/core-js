import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `export declare function` wraps TSDeclareFunction inside ExportNamedDeclaration.
// unwrapExport peels the wrapper so neutralize still retypes when rest param is present
export declare function fn(a: number, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[1];
_atMaybeString(x).call(x, 0);