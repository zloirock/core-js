import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// The receiver prefix precedes the hop read. A missing hop evaluates its live default
// once, and the supplied method prevents the leaf default from running.
const effects = [];
const source = {
  get data() {
    effects.push('get');
    return undefined;
  }
};
const lead = (effects.push('lead'), 1);
const {
  data: {
    at = (effects.push('leaf-default'), null)
  } = (effects.push('default'), Array.from('ab'))
} = (effects.push('prefix'), source);
export { lead, at, effects };