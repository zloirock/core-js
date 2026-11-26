import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
export function process({
  name
}: {
  name: string;
} = {
  name: 'hello'
}) {
  return name.at(0);
}