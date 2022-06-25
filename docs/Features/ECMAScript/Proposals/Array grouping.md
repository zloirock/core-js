# [`Array` grouping](https://github.com/tc39/proposal-array-grouping)
Modules [`esnext.array.group`](/packages/core-js/modules/esnext.array.group.js), [`esnext.array.group-to-map`](/packages/core-js/modules/esnext.array.group-to-map.js).
```js
class Array {
  group(callbackfn: (value: any, index: number, target: any) => key, thisArg?: any): { [key]: Array<mixed> };
  groupToMap(callbackfn: (value: any, index: number, target: any) => key, thisArg?: any): Map<key, Array<mixed>>;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/array-grouping-stage-3-2
core-js(-pure)/actual|full/array(/virtual)/group
core-js(-pure)/actual|full/array(/virtual)/group-to-map
```
[*Examples*](https://is.gd/3a0PbH):
```js
[1, 2, 3, 4, 5].group(it => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }

const map = [1, 2, 3, 4, 5].groupToMap(it => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]
```