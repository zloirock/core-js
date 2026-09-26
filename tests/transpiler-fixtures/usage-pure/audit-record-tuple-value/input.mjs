// Record<K, V> with V being a tuple should expose array methods through value access
type Dict = Record<string, [number, string]>;
declare const d: Dict;
d["k"].at(0);
