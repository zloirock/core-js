import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
const x = `${(() => {
  const {
    from
  } = Array;
  return from;
})()}`;