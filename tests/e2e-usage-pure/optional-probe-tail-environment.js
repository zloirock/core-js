// Keep the window patch separate: marking that probe mutated changes other slot tests in the file.
import { readAliasedRepeatedWindowProbe, readRepeatedWindowProbe } from './global-proxies.js';

QUnit.test('an optional tail keeps its second environment probe', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  if (descriptor && !descriptor.configurable) {
    assert.same(readRepeatedWindowProbe(), globalThis.window.chrome);
    assert.same(readAliasedRepeatedWindowProbe(), globalThis.window.chrome);
  } else {
    let reads = 0;
    try {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        get() {
          reads++;
          return reads === 1 ? { self: globalThis } : undefined;
        },
      });
      assert.same(readRepeatedWindowProbe(), undefined);
      assert.same(reads, 2);
      reads = 0;
      assert.throws(() => readAliasedRepeatedWindowProbe(), TypeError);
      assert.same(reads, 2);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
      else delete globalThis.window;
    }
  }
});
