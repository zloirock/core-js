import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
const getItems = () => [1, 2, 3].filter(x => x > 0);
getItems().at(-1);