import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a trailing `core-js-disable-line` inside an argument list covers the line it ends, as anywhere
// else: the argument on that line stays native, the one on the next line is served
// core-js-disable-next-line
use(Array.from(x),
// core-js-disable-line
y.at(0));