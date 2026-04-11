import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Wrapper<T> = {
  create: new () => T;
};
function getWrapper(): Wrapper<string[]> {
  return {
    create: Array
  };
}
new (getWrapper().create)().at(0);