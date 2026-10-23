import '@core-js/types/web/atob-btoa';
import '@core-js/types/web/dom-exception';
import '@core-js/types/web/efficient-script-yielding';
import '@core-js/types/web/iterable-dom-collections';
import '@core-js/types/web/queue-microtask';
import '@core-js/types/web/self';
import '@core-js/types/web/structured-clone';
import '@core-js/types/web/url';

const decoded: string = atob(btoa('core-js'));
const exception: DOMException = new DOMException('message', 'DataCloneError');
const immediate: number | object = setImmediate(() => {});
clearImmediate(immediate);
queueMicrotask(() => {});
const cloned: number[] = structuredClone([1, 2, 3]);
const ref: {} = self;

declare const tokens: DOMTokenList;
const tokenValues: IterableIterator<string> = tokens.values();
