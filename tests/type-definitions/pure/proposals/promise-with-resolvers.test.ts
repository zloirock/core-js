import promiseWithResolvers from '@core-js/pure/full/promise/with-resolvers';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers';

const pr = promiseWithResolvers<number>();
const pr2 = promiseWithResolvers<string>();
const pr3 = promiseWithResolvers<void>();

const p1 = pr.promise;
assertCoreJSPromiseLike<number>(p1);
const p2 = pr2.promise;
assertCoreJSPromiseLike<string>(p2);
const p3 = pr3.promise;
assertCoreJSPromiseLike<void>(p3);

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
