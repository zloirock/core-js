// `type ElementOf<T> = T extends (infer U)[] ? U : never` - narrow infer-pattern support
// recognizes the common "element-type extraction" shape and short-circuits to the checkType's
// inner type. `ElementOf<number[]>` should resolve to `number`, making `.toFixed()` pick the
// number-specific polyfill variant instead of the generic fallback
type ElementOf<T> = T extends (infer U)[] ? U : never;
declare const items: number[];
const first: ElementOf<typeof items> = items[0];
const repr = first.toFixed(2);
export { repr };
