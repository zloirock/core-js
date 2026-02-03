import '@core-js/types/proposals/array-unique';
const uniqueArr: number[] = [1, 2, 2, 3, 3, 3].uniqueBy();

import '@core-js/types/proposals/array-flat-map';
const flatMappedArr: number[] = [1, 2, 3].flatMap(x => [x, x * 2]);
