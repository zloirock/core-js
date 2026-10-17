import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A CALL receiver under a computed key that RESOLVES to a method name while carrying an effect: the dispatch spells the whole span
// itself - receiver memoized behind the guard, key effect migrated out - so the global channel's claim over the nav inside it has
// nothing left to compose into.
globalThis.claimBox = {
  list: ['ab', 'cd'],
  get: function () {
    return ['ef'];
  }
};
export const callReceiverStaticKey = globalThis.window?.self.claimBox.get().at(0);