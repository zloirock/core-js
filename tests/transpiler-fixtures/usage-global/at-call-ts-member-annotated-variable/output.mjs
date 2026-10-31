import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
declare function getConfig(): unknown;
// @ts-expect-error the annotation, not the initializer, types the value, which is the shape under test
const config: {
  name: string;
} = getConfig();
config.name.at(0);