![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

This package contains types for the global and pure versions of `core-js`.
Although `core-js` is a JavaScript standard library polyfill, the built-in TypeScript types are often not sufficient.
Additional types are needed for:
- features that are already in JavaScript but not yet in TypeScript’s standard types;
- proposals, including those already implemented in JavaScript engines;
- explicit imports of features from the pure version.

It is shipped as a separate package because we cannot guarantee stable behavior with future TypeScript releases, including minor ones.

# Installation
```bash
npm install --save @core-js/types@4.0.0-alpha.0
```

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
`@core-js/types` includes all types and entry points for the global version, but it is recommended to select only the subset you actually use.

## Usage of subsets
There are four main subsets:
- `@core-js/types/actual` - types for all actual features, including stable ECMAScript, web standards and Stage 3 ECMAScript proposals;
- `@core-js/types/es` - types for stable ECMAScript features only;
- `@core-js/types/stable` - types for stable ECMAScript and web standards features;
- `@core-js/types/full` - types for all features, including proposals.

You can import them the same way as the main package. For example, to use only the stable subset, add this to your `tsconfig.json`:
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

## Usage of specific features
If you need types only for specific features, you can import them like this:
```json
{
  "compilerOptions": {
    "types": [
      "@core-js/types/proposals/joint-iteration",
      "@core-js/types/web/structured-clone"
    ]
  }
}
```
or import them directly in your files:
```ts
import '@core-js/types/proposals/joint-iteration';
import '@core-js/types/web/structured-clone';
```
You can find types for specific features on the corresponding pages in the [documentation](https://core-js.io/v4/docs/).

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
Then, when you import from the pure entry points, the corresponding types are picked up automatically:
```ts
import $findLast from '@core-js/pure/full/array/find-last';

$findLast([1, 3, 4, 2], v => v > 2); // => 4
```

## Namespace usage in the pure version
If you need to use multiple methods from the same namespace, you can add `@core-js/types/pure` to `tsconfig.json` and import the entire namespace:
```ts
import $array from '@core-js/pure/full/array';

$array.findLast([1, 3, 4, 2], v => v > 2);
$array.flatMap([1, 2, 3], x => [x, x * 2]);
```
(note that this is not recommended since tree shaking does not properly work in this case)

# DOM types
Some of the global types for web standards work correctly only with the DOM lib.
You need to add DOM types to the `lib` section of your `tsconfig.json` in addition to `@core-js/types`. For example:
```json
{
  "compilerOptions": {
    "types": ["@core-js/types"],
    "lib": ["esnext", "dom"]
  }
}
```
In the pure version, you can use these types without adding the DOM lib.
