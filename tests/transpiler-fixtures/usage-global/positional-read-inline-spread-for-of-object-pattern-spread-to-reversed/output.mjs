import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
for (const {
  x: viaMemberCommon
} of [...[{
  x: [1]
}], {
  x: [2]
}]) {
  viaMemberCommon.toReversed();
  viaMemberCommon.at(0);
}