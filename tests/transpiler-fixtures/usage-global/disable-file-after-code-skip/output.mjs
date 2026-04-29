import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// `core-js-disable-file` directive only takes effect when placed at file head; here it appears
// after a code statement, so the entire file (including code below the directive) gets polyfilled
arr.includes(x);
// core-js-disable-file
arr.at(0);