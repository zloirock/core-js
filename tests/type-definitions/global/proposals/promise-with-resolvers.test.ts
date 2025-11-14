import 'core-js/full';
import '@core-js/types';

const pr = Promise.withResolvers<number>();
const pr2 = Promise.withResolvers<string>();
const pr3 = Promise.withResolvers<void>();

const p1: Promise<number> = pr.promise;
const p2: Promise<string> = pr2.promise;
const p3: Promise<void> = pr3.promise;

pr.resolve(42);
pr.resolve(Promise.resolve(43));
pr.reject();
pr.reject('some error');

pr2.resolve('test');
pr2.resolve(Promise.resolve('hi'));
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
Promise.withResolvers(123);

// @ts-expect-error
Promise.withResolvers<string>(123);
