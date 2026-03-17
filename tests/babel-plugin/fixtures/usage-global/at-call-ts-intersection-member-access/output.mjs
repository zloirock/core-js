import "core-js/modules/es.array.at";
declare const user: {
  id: number;
} & {
  name: string[];
};
user.name.at(0);