import "core-js/modules/es.array.at";
import "core-js/modules/es.string.sup";
const fn = () => ['x', 'y'];
const obj = {
  get items() {
    if (this._cache) return fn;
    this._cache = true;
    return fn;
  }
};
obj.items().at(0).sup();