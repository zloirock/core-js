// `Parameters<typeof fn>[1]` — tuple-index access on the derived tuple. `findTupleElement`
// recognizes `Parameters<typeof fn>` / `ConstructorParameters<...>` and extracts the N-th
// param's annotation. here `[1]` picks up `string`, routing `.at(0)` to String-specific
declare function fn(x: number, y: string, z: boolean): void;
declare const second: Parameters<typeof fn>[1];
second.at(0);
