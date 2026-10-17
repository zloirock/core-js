import "core-js/modules/es.object.entries";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
export function bothArmsDestructure(flag) {
  if (flag) {
    var H = globalThis;
  } else {
    var H = self;
  }
  const {
    Object: {
      entries
    }
  } = H;
  return entries({
    a: 1
  });
}