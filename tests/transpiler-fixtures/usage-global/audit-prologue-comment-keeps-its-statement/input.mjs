'use strict';
// babel hands an own-line comment to the directive AND to the statement below it, and the head
// insertion goes between them. an opt-out that slides onto OUR import stops guarding the line
// the author marked - and a later pass over this output would adopt and duplicate it
// core-js-disable-next-line
import "core-js/modules/es.array.flat";
export const a = [1].at(0);
