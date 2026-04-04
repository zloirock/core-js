import "core-js/modules/es.string.at";
const config: {
  items: number[];
  name: string;
} = getConfig();
const {
  name
}: Pick<{
  items: number[];
  name: string;
}, 'name'> = config;
name.at(0);