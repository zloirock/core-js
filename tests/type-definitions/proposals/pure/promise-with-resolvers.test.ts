import promiseWithResolvers from '@core-js/pure/full/promise/with-resolvers';
import promiseResolve from '@core-js/pure/full/promise/resolve';

const pr = promiseWithResolvers<number>();
const pr2 = promiseWithResolvers<string>();
const pr3 = promiseWithResolvers<void>();

const p1: Promise<number> = pr.promise;
const p2: Promise<string> = pr2.promise;
const p3: Promise<void> = pr3.promise;

pr.resolve(42);
pr.resolve(promiseResolve(43));
pr.reject();
pr.reject('some error');

pr2.resolve('test');
pr2.resolve(promiseResolve('hi'));
pr2.reject(new Error('fail'));
pr3.resolve(undefined);
pr3.reject();

const value: number | PromiseLike<number> = 99;
pr.resolve(value);

declare function agrees<T>(): PromiseWithResolvers<T>;
const gr: PromiseWithResolvers<boolean> = agrees<boolean>();
gr.resolve(true);
gr.reject();

// @ts-expect-error
promiseWithResolvers(123);

// @ts-expect-error
promiseWithResolvers<string>(123);
