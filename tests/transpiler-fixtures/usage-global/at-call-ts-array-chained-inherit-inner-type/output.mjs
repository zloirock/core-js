import "core-js/modules/es.array.at";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.string.code-point-at";
const arr: string[] = ['a', 'b', 'c'];
arr.toSorted().at(0).codePointAt(0);