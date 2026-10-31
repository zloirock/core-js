import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
const arr = [1, 2];
let dKey = 'findLast';
if (c) dKey = 'findLastIndex';
const {
  [dKey]: extracted
} = arr;
export const viaDestructure = extracted;