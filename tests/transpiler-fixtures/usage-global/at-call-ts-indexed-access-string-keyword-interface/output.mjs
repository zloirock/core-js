import "core-js/modules/es.array.at";
interface Dict {
  [key: string]: number[];
}
declare const entry: Dict[string];
entry.at(0);