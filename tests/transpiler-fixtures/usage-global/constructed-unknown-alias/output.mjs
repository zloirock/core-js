import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A constructor alias does not prove the family of its result.
const Alias = ExternalList;
new Alias().at(-1);