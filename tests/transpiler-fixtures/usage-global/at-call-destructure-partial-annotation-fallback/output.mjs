import "core-js/modules/es.array.at";
const config: {
  items: string[];
} = getConfig();
const {
  items
}: Partial<{
  items: string[];
}> = config;
items.at(-1);