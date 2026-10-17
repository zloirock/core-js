import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/web.self";
export function armShadowsTheRealmName(flag) {
  if (flag) {
    const globalThis = {};
    var S = globalThis;
  } else {
    var S = self;
  }
  return S.Object.getOwnPropertyNames({
    c: 3
  });
}