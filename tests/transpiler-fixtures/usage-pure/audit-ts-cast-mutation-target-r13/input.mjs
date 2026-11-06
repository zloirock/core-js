// An enum-spelled static write keeps the patched method on the constructor.
enum WriteKeys { OF = 'of' }
// @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
Array[WriteKeys.OF] = function () { return [9]; };
export const r13 = Array.of(1);
