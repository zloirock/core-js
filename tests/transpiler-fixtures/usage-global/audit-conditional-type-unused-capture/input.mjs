// Declaring an infer parameter does not itself create a runtime expectation.
// Neither a discarded capture nor its function-return spelling needs the compared global.
declare const direct: Set<number> extends infer Captured ? string : boolean;
declare const returned: (() => Promise<number>) extends (() => infer Captured) ? string : boolean;
export { direct, returned };
