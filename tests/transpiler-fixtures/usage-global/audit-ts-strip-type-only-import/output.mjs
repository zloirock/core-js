import "core-js/modules/es.array.at";
import { baz } from './bar';
import './side-effect.css';

// type-only specifiers stripped by `@babel/plugin-transform-typescript`; remaining
// real imports must still anchor polyfill insertion correctly
const xs = [];
xs.at(-1);
baz();