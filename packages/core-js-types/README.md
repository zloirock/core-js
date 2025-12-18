![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)
This package contains types for global & pure versions of `core-js`.
Although `core-js` is a polyfill library for the JavaScript, the built-in TypeScript types are not sufficient. 
Additional types are needed for:
- features that are already in JavaScript, but not yet in TypeScript’s standard types;
- proposals, including those already implemented in JavaScript engines;
- explicit imports of features from the pure version.

It is shipped as a separate package, because we cannot guarantee stable behavior, 
primarily with upcoming minor TypeScript releases.

# Installation
`npm install --save @core-js/types@4.0.0-alpha.0`

# Usage
Add to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
      "@core-js/types"
    ]
  }
}
```
or import it directly in your files:
```ts
import '@core-js/types';
```
`@core-js/types` includes all types and entry points for the global version, but it is recommended to select only the subset you actually use instead.

## Usage of subsets
There are 4 types of subset:
- `@core-js/types/actual` - types for all actual features, including stable ECMAScript, web standards and stage 3 ECMAScript proposals
- `@core-js/types/es` - types for stable ECMAScript features only
- `@core-js/types/stable` - types for stable ECMAScript and web standards features
- `@core-js/types/full` - types for all features, including proposals
You can import them the same way as the main package, for example, to use stable version, add this to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
      "@core-js/types/stable"
    ]
  }
}
```
or import it directly in your files:
```ts
import '@core-js/types/stable';
```

# Types for the pure version
## Base usage
Add this to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
      "@core-js/types/pure"
    ]
  }
}
```
then, when you import from the pure entry points, the corresponding types are picked up automatically:
```ts
import $findLast from '@core-js/pure/full/array/find-last';

$findLast([1, 3, 4, 2], v => v > 2); // => 4
```

## Namespace usage
If you need to use multiple methods from the same namespace, you can add `@core-js/types/pure` to `tsconfig.json`
and import the entire namespace instead:
```ts
import $array from '@core-js/pure/full/array';

$array.findLast([1, 3, 4, 2], v => v > 2);
$array.flatMap([1, 2, 3], x => [x, x * 2]);
```

# DOM types
A part of the global types for web standards work correctly only with the DOM lib.
You need to add DOM types to the `lib` section of your `tsconfig.json`, for example:
```json
{
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  }
}
```
In the `pure` version you can use it without adding DOM lib
