import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Named = {
  name: string;
};
declare const entry: Named[string];
entry.at(0);