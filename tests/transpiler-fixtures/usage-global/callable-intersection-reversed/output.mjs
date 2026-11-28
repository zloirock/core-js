import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
declare const stringFirst: (() => string) & (() => string[]);
export const b = stringFirst().at(0);