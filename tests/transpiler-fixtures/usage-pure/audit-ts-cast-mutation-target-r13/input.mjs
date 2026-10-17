// An enum-spelled static write keeps the patched method on the constructor.
enum WriteKeys { OF = 'of' }
Array[WriteKeys.OF] = function () { return [9]; };
export const r13 = Array.of(1);
