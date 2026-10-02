import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A file-visible Object.prototype write invalidates the inherited Function proof.
// The nested receiver must keep dispatch for the installed array value.
Object.prototype.toString = [1, 2];
use({}.toString.at(-1));