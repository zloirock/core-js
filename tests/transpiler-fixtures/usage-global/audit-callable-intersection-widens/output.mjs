import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An intersection of competing call results remains wide.
declare const arrayFirst: (() => string[]) & (() => string);
export const a = arrayFirst().at(0);