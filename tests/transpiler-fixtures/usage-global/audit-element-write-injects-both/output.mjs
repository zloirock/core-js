import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// usage-global twin of the element-retype bail: an element write invalidates the element
// precision, so the read widens and injects BOTH families (over-inject-safe)
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = written[0].at(0);