// An enum-spelled write leaves the neighboring static substitutable.
enum WriteKeys { OF = 'of' }
Array[WriteKeys.OF] = function () { return [9]; };
export const r14 = Array.from([2]);
