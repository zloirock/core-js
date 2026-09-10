// the ordinary-module control of the id-flow legs: a plain `.js` id, admitted at every phase
import App from './App.vue';
import Tpl from './Tpl.vue';
import WorkerWrapper from './worker-wrapper.js?worker';

globalThis.mainResult = Object.hasOwn({ a: 1 }, 'a');
globalThis.workerSource = new Worker(new URL('./worker-source.js', import.meta.url), { type: 'module' });

export { App, Tpl, WorkerWrapper };
