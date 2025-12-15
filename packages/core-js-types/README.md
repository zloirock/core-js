![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

# Installation
`npm install --save @core-js/types`

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

# Usage of pure version
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

# DOM types
To work with DOM, you need to add DOM types to the `lib` section of your `tsconfig.json`, for example:
```json
{
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  }
}
```
In `pure` version you can use it without adding additional DOM types:
```ts
import $parse from '@core-js/pure/full/url/parse';

$parse('https://example.com/path?name=value#hash');
```

# Namespace usage in pure version
If you need to use multiple methods from the same namespace, you can import the entire namespace instead:
```ts
import $array from '@core-js/pure/full/array';

$array.findLast([1, 3, 4, 2], v => v > 2);
$array.flatMap([1, 2, 3], x => [x, x * 2]);
```

# Package variants
You can import different variants of the package types:
```ts
import '@core-js/types/actual'; // types for all actual features - stable ES, web standards and stage 3 ES proposals
import '@core-js/types/full'; // types for all features - stable ES, web standards and all proposals
import '@core-js/types/stable'; // types for stable features - ES and web standards
import '@core-js/types/es'; // types for only stable ES features
```

# Reference import
