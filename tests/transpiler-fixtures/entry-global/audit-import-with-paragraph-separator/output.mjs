import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Real U+2029 (paragraph separator) follows the entry import; removeTopLevelStatement
// must consume it via isLineTerminator instead of leaving it dangling.

const result = [].includes(1);