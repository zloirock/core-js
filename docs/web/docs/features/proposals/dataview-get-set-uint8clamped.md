# `DataView` get / set `Uint8Clamped` methods
[Specification](https://tc39.es/proposal-dataview-get-set-uint8clamped/)\
[Proposal repo](https://github.com/tc39/proposal-dataview-get-set-uint8clamped)

## Modules
[`esnext.data-view.get-uint8-clamped`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.data-view.get-uint8-clamped.js) and [`esnext.data-view.set-uint8-clamped`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.data-view.set-uint8-clamped.js)

## Built-ins signatures
```ts
class DataView {
  getUint8Clamped(offset: any): uint8
  setUint8Clamped(offset: any, value: any): void;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/data-view-get-set-uint8-clamped
core-js/full/dataview/get-uint8-clamped
core-js/full/dataview/set-uint8-clamped
```

## Examples
```js
const view = new DataView(new ArrayBuffer(1));
view.setUint8Clamped(0, 100500);
console.log(view.getUint8Clamped(0)); // => 255
```
