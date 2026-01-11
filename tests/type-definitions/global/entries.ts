import '@core-js/types/stable';
Iterator.concat([]);
// @ts-expect-error
Iterator.zipKeyed([]);

import '@core-js/types/proposals/array-unique';
const uniqueArr: number[] = [1, 2, 2, 3, 3, 3].uniqueBy();
