import "core-js/modules/es.array.at";
declare const config: {
  items: string[];
};
declare const x: typeof config.items;
x.at(-1);