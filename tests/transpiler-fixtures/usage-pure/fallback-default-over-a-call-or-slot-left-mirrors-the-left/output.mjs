import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a `||` / `??` parameter default whose left always yields a constructor through a call, an IIFE, a static container's
// slot or a class static becomes the literal that left mirrors, its other keys read off the left re-spelled -
// in an exported function, whose callers nothing sees, as in a local one; a dead prefix of the left drops
const mkM = () => _Map;
const box = {
  U: _Map
};
class K {
  static U = _Map;
}
export function viaCall({
  groupBy,
  prototype
} = function (_ref) {
  return {
    groupBy: _Map$groupBy,
    get prototype() {
      return _ref.prototype;
    }
  };
}(mkM())) {
  return [groupBy, prototype];
}
export function viaIife({
  groupBy,
  prototype
} = function (_ref2) {
  return {
    groupBy: _Map$groupBy,
    get prototype() {
      return _ref2.prototype;
    }
  };
}((() => _Map)())) {
  return [groupBy, prototype];
}
export function viaSlot({
  groupBy,
  prototype
} = function (_ref3) {
  return {
    groupBy: _Map$groupBy,
    get prototype() {
      return _ref3.prototype;
    }
  };
}(box.U)) {
  return [groupBy, prototype];
}
export function viaStatic({
  groupBy,
  prototype
} = function (_ref4) {
  return {
    groupBy: _Map$groupBy,
    get prototype() {
      return _ref4.prototype;
    }
  };
}(K.U)) {
  return [groupBy, prototype];
}
export function viaSequence({
  groupBy,
  prototype
} = function (_ref5) {
  return {
    groupBy: _Map$groupBy,
    get prototype() {
      return _ref5.prototype;
    }
  };
}((0, mkM()))) {
  return [groupBy, prototype];
}
function local({
  groupBy,
  prototype
} = function (_ref6) {
  return {
    groupBy: _Map$groupBy,
    get prototype() {
      return _ref6.prototype;
    }
  };
}(mkM())) {
  return [groupBy, prototype];
}
export const viaLocal = local();