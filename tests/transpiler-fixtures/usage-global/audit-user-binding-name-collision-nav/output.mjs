import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.self";
// the names the injector mints are ordinary identifiers a file may already own. composition locates
// an inner rewrite whose head the outer already resolved, and only a name the injector ACTUALLY
// minted counts as that resolution - a user identifier of the same shape is data, and treating it
// as the nav's own slot rewrote the user's expression while leaving the nav native
globalThis.collideBox = {
  list: ['ab', 'cd']
};
const _globalThis = {
  window: {
    self: {
      collideBox: {
        list: [9]
      }
    }
  }
};
const _globalThis2 = {
  window: {
    self: {
      collideBox: {
        list: [8]
      }
    }
  }
};
const _self = {
  collideBox: {
    list: [7]
  }
};
export const ownedHeadName = (_globalThis.window?.self.collideBox.list, globalThis.window?.self.collideBox.list)?.at(0);
export const ownedDedupName = (_globalThis2.window?.self.collideBox.list, globalThis.window?.self.collideBox.list)?.at(0);
export const ownedLeafName = (_self.collideBox.list, globalThis.window?.self.collideBox.list)?.at(0);
export const separateStatements = ('x', _globalThis2.window?.self.collideBox.list)?.at(0);
export { _globalThis, _globalThis2, _self };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.collideBox.list ? 0 : 1)?.includes('a');