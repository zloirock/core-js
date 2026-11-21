import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
export function absent(log) {
  {
    var undefined = void log.push('init');
  }
  return (({
    from
  } = Array) => from([4]))(undefined);
}