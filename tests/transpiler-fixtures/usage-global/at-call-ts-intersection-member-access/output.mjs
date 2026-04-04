import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
declare const user: {
  id: number;
} & {
  name: string[];
};
user.name.at(0);