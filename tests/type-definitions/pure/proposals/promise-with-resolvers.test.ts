import promiseWithResolvers from '@core-js/pure/full/promise/with-resolvers';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import CoreJSPromiseLike from '../../helpers';

const pr = promiseWithResolvers<number>();
const pr2 = promiseWithResolvers<string>();
const pr3 = promiseWithResolvers<void>();

const p1: CoreJSPromiseLike<number> = pr.promise;
const p2: CoreJSPromiseLike<string> = pr2.promise;
const p3: CoreJSPromiseLike<void> = pr3.promise;

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

// @ts-expect-error
promiseWithResolvers(123);

// @ts-expect-error
promiseWithResolvers<string>(123);
