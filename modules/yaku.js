/*eslint-disable*/
(function () {
    "use strict";

    var $undefined
    , $null = null
    , root = typeof global === "object" ? global : window
    , isLongStackTrace = false
    , process = root.process
    , Arr = Array
    , Err = Error

    , $rejected = 0
    , $resolved = 1
    , $pending = 2

    , $Symbol = "Symbol"
    , $iterator = "iterator"
    , $return = "return"

    , $unhandled = "_uh"
    , $promiseTrace = "_pt"
    , $settlerTrace = "_st"

    , $invalidThis = "Invalid this"
    , $invalidArgument = "Invalid argument"
    , $fromPrevious = "\nFrom previous "
    , $promiseCircularChain = "Chaining cycle detected for promise"
    , $unhandledRejectionMsg = "Uncaught (in promise)"
    , $rejectionHandled = "rejectionHandled"
    , $unhandledRejection = "unhandledRejection"

    , $tryCatchFn
    , $tryCatchThis
    , $tryErr = { e: $null }
    , $noop = function () {}
    ;

    /**
     * This class follows the [Promises/A+](https://promisesaplus.com) and
     * [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
     * with some extra helpers.
     * @param  {Function} executor Function object with two arguments resolve, reject.
     * The first argument fulfills the promise, the second argument rejects it.
     * We can call these functions, once our operation is completed.
     */
    var Yaku = module.exports = function Promise (executor) {
        var self = this,
            err;

        // "this._s" is the internal state of: pending, resolved or rejected
        // "this._v" is the internal value

        if (!isObject(self) || self._s !== $undefined)
            throw genTypeError($invalidThis);

        self._s = $pending;

        if (isLongStackTrace) self[$promiseTrace] = genTraceInfo();

        if (executor !== $noop) {
            if (!isFunction(executor))
                throw genTypeError($invalidArgument);

            err = genTryCatcher(executor)(
                genSettler(self, $resolved),
                genSettler(self, $rejected)
            );

            if (err === $tryErr)
                settlePromise(self, $rejected, err.e);
        }
    };

    Yaku["default"] = Yaku;

    extendPrototype(Yaku, {
        /**
         * Appends fulfillment and rejection handlers to the promise,
         * and returns a new promise resolving to the return value of the called handler.
         * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
         * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
         * @return {Yaku} It will return a new Yaku which will resolve or reject after
         * @example
         * the current Promise.
         * ```js
         * var Promise = require('yaku');
         * var p = Promise.resolve(10);
         *
         * p.then((v) => {
         *     console.log(v);
         * });
         * ```
         */
        then: function then (onFulfilled, onRejected) {
            return addHandler(
                this,
                newCapablePromise(Yaku.speciesConstructor(this, Yaku)),
                onFulfilled,
                onRejected
            );
        },

        /**
         * The `catch()` method returns a Promise and deals with rejected cases only.
         * It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.
         * @param  {Function} onRejected A Function called when the Promise is rejected.
         * This function has one argument, the rejection reason.
         * @return {Yaku} A Promise that deals with rejected cases only.
         * @example
         * ```js
         * var Promise = require('yaku');
         * var p = Promise.reject(new Error("ERR"));
         *
         * p['catch']((v) => {
         *     console.log(v);
         * });
         * ```
         */
        "catch": function (onRejected) {
            return this.then($undefined, onRejected);
        },

        // The number of current promises that attach to this Yaku instance.
        _pCount: 0,

        // The parent Yaku.
        _pre: $null,

        // A unique type flag, it helps different versions of Yaku know each other.
        _Yaku: 1
    });

    /**
     * The `Promise.resolve(value)` method returns a Promise object that is resolved with the given value.
     * If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
     * adopting its eventual state; otherwise the returned promise will be fulfilled with the value.
     * @param  {Any} value Argument to be resolved by this Promise.
     * Can also be a Promise or a thenable to resolve.
     * @return {Yaku}
     * @example
     * ```js
     * var Promise = require('yaku');
     * var p = Promise.resolve(10);
     * ```
     */
    Yaku.resolve = function resolve (val) {
        return isYaku(val) ? val : settleWithX(newCapablePromise(this), val);
    };

    /**
     * The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.
     * @param  {Any} reason Reason why this Promise rejected.
     * @return {Yaku}
     * @example
     * ```js
     * var Promise = require('yaku');
     * var p = Promise.reject(new Error("ERR"));
     * ```
     */
    Yaku.reject = function reject (reason) {
        return settlePromise(newCapablePromise(this), $rejected, reason);
    };

    /**
     * The `Promise.race(iterable)` method returns a promise that resolves or rejects
     * as soon as one of the promises in the iterable resolves or rejects,
     * with the value or reason from that promise.
     * @param  {iterable} iterable An iterable object, such as an Array.
     * @return {Yaku} The race function returns a Promise that is settled
     * the same way as the first passed promise to settle.
     * It resolves or rejects, whichever happens first.
     * @example
     * ```js
     * var Promise = require('yaku');
     * Promise.race([
     *     123,
     *     Promise.resolve(0)
     * ])
     * .then((value) => {
     *     console.log(value); // => 123
     * });
     * ```
     */
    Yaku.race = function race (iterable) {
        var self = this
        , p = newCapablePromise(self)

        , resolve = function (val) {
            settlePromise(p, $resolved, val);
        }

        , reject = function (val) {
            settlePromise(p, $rejected, val);
        }

        , ret = genTryCatcher(each)(iterable, function (v) {
            self.resolve(v).then(resolve, reject);
        });

        if (ret === $tryErr) return self.reject(ret.e);

        return p;
    };

    /**
     * The `Promise.all(iterable)` method returns a promise that resolves when
     * all of the promises in the iterable argument have resolved.
     *
     * The result is passed as an array of values from all the promises.
     * If something passed in the iterable array is not a promise,
     * it's converted to one by Promise.resolve. If any of the passed in promises rejects,
     * the all Promise immediately rejects with the value of the promise that rejected,
     * discarding all the other promises whether or not they have resolved.
     * @param  {iterable} iterable An iterable object, such as an Array.
     * @return {Yaku}
     * @example
     * ```js
     * var Promise = require('yaku');
     * Promise.all([
     *     123,
     *     Promise.resolve(0)
     * ])
     * .then((values) => {
     *     console.log(values); // => [123, 0]
     * });
     * ```
     * @example
     * Use with iterable.
     * ```js
     * var Promise = require('yaku');
     * Promise.all((function * () {
     *     yield 10;
     *     yield new Promise(function (r) { setTimeout(r, 1000, "OK") });
     * })())
     * .then((values) => {
     *     console.log(values); // => [123, 0]
     * });
     * ```
     */
    Yaku.all = function all (iterable) {
        var self = this
        , p1 = newCapablePromise(self)
        , res = []
        , ret
        ;

        function reject (reason) {
            settlePromise(p1, $rejected, reason);
        }

        ret = genTryCatcher(each)(iterable, function (item, i) {
            self.resolve(item).then(function (value) {
                res[i] = value;
                if (!--ret) settlePromise(p1, $resolved, res);
            }, reject);
        });

        if (ret === $tryErr) return self.reject(ret.e);

        if (!ret) settlePromise(p1, $resolved, []);

        return p1;
    };

    /**
     * The ES6 Symbol object that Yaku should use, by default it will use the
     * global one.
     * @type {Object}
     * @example
     * ```js
     * var core = require("core-js/library");
     * var Promise = require("yaku");
     * Promise.Symbol = core.Symbol;
     * ```
     */
    Yaku.Symbol = root[$Symbol] || {};

    /**
     * Use this api to custom the species behavior.
     * https://tc39.github.io/ecma262/#sec-speciesconstructor
     * @param {Any} O The current this object.
     * @param {Function} defaultConstructor
     */
    Yaku.speciesConstructor = function (O, D) {
        var C = O.constructor;

        return C ? (C[Yaku[$Symbol].species] || C) : D;
    };

    /**
     * Catch all possibly unhandled rejections. If you want to use specific
     * format to display the error stack, overwrite it.
     * If it is set, auto `console.error` unhandled rejection will be disabled.
     * @param {Any} reason The rejection reason.
     * @param {Yaku} p The promise that was rejected.
     * @example
     * ```js
     * var Promise = require('yaku');
     * Promise.onUnhandledRejection = (reason) => {
     *     console.error(reason);
     * };
     *
     * // The console will log an unhandled rejection error message.
     * Promise.reject('my reason');
     *
     * // The below won't log the unhandled rejection error message.
     * Promise.reject('v').catch(() => {});
     * ```
     */
    Yaku.unhandledRejection = function (reason, p) {
        var con = root.console;
        if (con) {
            con.error($unhandledRejectionMsg, genStackInfo(reason, p));
        }
    };

    /**
     * Emitted whenever a Promise was rejected and an error handler was
     * attached to it (for example with .catch()) later than after an event loop turn.
     * @param {Any} reason The rejection reason.
     * @param {Yaku} p The promise that was rejected.
     */
    Yaku.rejectionHandled = $noop;

    /**
     * It is used to enable the long stack trace.
     * Once it is enabled, it can't be reverted.
     * While it is very helpful in development and testing environments,
     * it is not recommended to use it in production. It will slow down your
     * application and waste your memory.
     * @example
     * ```js
     * var Promise = require('yaku');
     * Promise.enableLongStackTrace();
     * ```
     */
    Yaku.enableLongStackTrace = function () {
        isLongStackTrace = true;
    };

    /**
     * Only Node has `process.nextTick` function. For browser there are
     * so many ways to polyfill it. Yaku won't do it for you, instead you
     * can choose what you prefer. For example, this project
     * [setImmediate](https://github.com/YuzuJS/setImmediate).
     * By default, Yaku will use `process.nextTick` on Node, `setTimeout` on browser.
     * @type {Function}
     * @example
     * ```js
     * var Promise = require('yaku');
     * Promise.nextTick = fn => window.setImmediate(fn);
     * ```
     * @example
     * You can even use sync resolution if you really know what you are doing.
     * ```js
     * var Promise = require('yaku');
     * Promise.nextTick = fn => fn();
     * ```
     */
    Yaku.nextTick = process ?
        process.nextTick :
        function (fn) { setTimeout(fn); };

    // ********************** Private **********************

    Yaku._Yaku = 1;

    /**
     * All static variable name will begin with `$`. Such as `$rejected`.
     * @private
     */

    // ******************************* Utils ********************************

    function extendPrototype (src, target) {
        for (var k in target) {
            src.prototype[k] = target[k];
        }
        return src;
    }

    function isObject (obj) {
        return typeof obj === "object";
    }

    function isFunction (obj) {
        return typeof obj === "function";
    }

    function isInstanceOf (a, b) {
        return a instanceof b;
    }

    function isError (obj) {
        return isInstanceOf(obj, Err);
    }

    function ensureType (obj, fn, msg) {
        if (!fn(obj)) throw genTypeError(msg);
    }

    /**
     * Wrap a function into a try-catch.
     * @private
     * @return {Any | $tryErr}
     */
    function tryCatcher () {
        try {
            return $tryCatchFn.apply($tryCatchThis, arguments);
        } catch (e) {
            $tryErr.e = e;
            return $tryErr;
        }
    }

    /**
     * Generate a try-catch wrapped function.
     * @private
     * @param  {Function} fn
     * @return {Function}
     */
    function genTryCatcher (fn, self) {
        $tryCatchFn = fn;
        $tryCatchThis = self;
        return tryCatcher;
    }

    /**
     * Generate a scheduler.
     * @private
     * @param  {Integer}  initQueueSize
     * @param  {Function} fn `(Yaku, Value) ->` The schedule handler.
     * @return {Function} `(Yaku, Value) ->` The scheduler.
     */
    function genScheduler (initQueueSize, fn) {
        /**
         * All async promise will be scheduled in
         * here, so that they can be execute on the next tick.
         * @private
         */
        var fnQueue = Arr(initQueueSize)
        , fnQueueLen = 0;

        /**
         * Run all queued functions.
         * @private
         */
        function flush () {
            var i = 0;
            while (i < fnQueueLen) {
                fn(fnQueue[i], fnQueue[i + 1]);
                fnQueue[i++] = $undefined;
                fnQueue[i++] = $undefined;
            }

            fnQueueLen = 0;
            if (fnQueue.length > initQueueSize) fnQueue.length = initQueueSize;
        }

        return function (v, arg) {
            fnQueue[fnQueueLen++] = v;
            fnQueue[fnQueueLen++] = arg;

            if (fnQueueLen === 2) Yaku.nextTick(flush);
        };
    }

    /**
     * Generate a iterator
     * @param  {Any} obj
     * @private
     * @return {Object || TypeError}
     */
    function each (iterable, fn) {
        var len
        , i = 0
        , iter
        , item
        , ret
        ;

        if (!iterable) throw genTypeError($invalidArgument);

        var gen = iterable[Yaku[$Symbol][$iterator]];
        if (isFunction(gen))
            iter = gen.call(iterable);
        else if (isFunction(iterable.next))
            iter = iterable;
        else if (isInstanceOf(iterable, Arr)) {
            len = iterable.length;
            while (i < len) {
                fn(iterable[i], i++);
            }
            return i;
        } else
            throw genTypeError($invalidArgument);

        while (!(item = iter.next()).done) {
            ret = genTryCatcher(fn)(item.value, i++);
            if (ret === $tryErr) {
                if (isFunction(iter[$return])) iter[$return]();
                throw ret.e;
            }
        }

        return i;
    }

    /**
     * Generate type error object.
     * @private
     * @param  {String} msg
     * @return {TypeError}
     */
    function genTypeError (msg) {
        return new TypeError(msg);
    }

    function genTraceInfo (noTitle) {
        return (noTitle ? "" : $fromPrevious) + (new Err().stack || "");
    }


    // *************************** Promise Helpers ****************************

    /**
     * Resolve the value returned by onFulfilled or onRejected.
     * @private
     * @param {Yaku} p1
     * @param {Yaku} p2
     */
    var scheduleHandler = genScheduler(999, function (p1, p2) {
        var x, handler;

        // 2.2.2
        // 2.2.3
        handler = p1._s ? p2._onFulfilled : p2._onRejected;

        // 2.2.7.3
        // 2.2.7.4
        if (handler === $undefined) {
            settlePromise(p2, p1._s, p1._v);
            return;
        }

        // 2.2.7.1
        x = genTryCatcher(callHanler)(handler, p1._v);
        if (x === $tryErr) {
            // 2.2.7.2
            settlePromise(p2, $rejected, x.e);
            return;
        }

        settleWithX(p2, x);
    });

    var scheduleUnhandledRejection = genScheduler(9, function (p) {
        if (!hashOnRejected(p)) {
            p[$unhandled] = 1;
            emitEvent($unhandledRejection, p);
        }
    });

    function emitEvent (name, p) {
        var browserEventName = "on" + name.toLowerCase()
            , browserHandler = root[browserEventName];

        if (process && process.listeners(name).length)
            name === $unhandledRejection ?
                process.emit(name, p._v, p) : process.emit(name, p);
        else if (browserHandler)
            browserHandler({ reason: p._v, promise: p });
        else
            Yaku[name](p._v, p);
    }

    function isYaku (val) { return val && val._Yaku; }

    function newCapablePromise (Constructor) {
        if (isYaku(Constructor)) return new Constructor($noop);

        var p, r, j;
        p = new Constructor(function (resolve, reject) {
            if (p) throw genTypeError();

            r = resolve;
            j = reject;
        });

        ensureType(r, isFunction);
        ensureType(j, isFunction);

        return p;
    }

    /**
     * It will produce a settlePromise function to user.
     * Such as the resolve and reject in this `new Yaku (resolve, reject) ->`.
     * @private
     * @param  {Yaku} self
     * @param  {Integer} state The value is one of `$pending`, `$resolved` or `$rejected`.
     * @return {Function} `(value) -> undefined` A resolve or reject function.
     */
    function genSettler (self, state) {
        return function (value) {
            if (isLongStackTrace)
                self[$settlerTrace] = genTraceInfo(true);

            if (state === $resolved)
                settleWithX(self, value);
            else
                settlePromise(self, state, value);
        };
    }

    /**
     * Link the promise1 to the promise2.
     * @private
     * @param {Yaku} p1
     * @param {Yaku} p2
     * @param {Function} onFulfilled
     * @param {Function} onRejected
     */
    function addHandler (p1, p2, onFulfilled, onRejected) {
        // 2.2.1
        if (isFunction(onFulfilled))
            p2._onFulfilled = onFulfilled;
        if (isFunction(onRejected)) {
            if (p1[$unhandled]) emitEvent($rejectionHandled, p1);

            p2._onRejected = onRejected;
        }

        if (isLongStackTrace) p2._pre = p1;
        p1[p1._pCount++] = p2;

        // 2.2.6
        if (p1._s !== $pending)
            scheduleHandler(p1, p2);

        // 2.2.7
        return p2;
    }

    // iterate tree
    function hashOnRejected (node) {
        // A node shouldn't be checked twice.
        if (node._umark)
            return true;
        else
            node._umark = true;

        var i = 0
        , len = node._pCount
        , child;

        while (i < len) {
            child = node[i++];
            if (child._onRejected || hashOnRejected(child)) return true;
        }
    }

    function genStackInfo (reason, p) {
        var stackInfo = [];

        function trim (str) { return str.replace(/^\s+|\s+$/g, ""); }

        function push (trace) {
            return stackInfo.push(trim(trace));
        }

        if (isLongStackTrace && p[$promiseTrace]) {
            if (p[$settlerTrace])
                push(p[$settlerTrace]);

            // Hope you guys could understand how the back trace works.
            // We only have to iterate through the tree from the bottom to root.
            (function iter (node) {
                if (node) {
                    iter(node._next);
                    push(node[$promiseTrace]);
                    iter(node._pre);
                }
            })(p);
        }

        return (isError(reason) ? reason.stack : reason)
            + ("\n" + stackInfo.join("\n")).replace(/^.+\/node_modules\/yaku\/.+\n?/mg, "");
    }

    function callHanler (handler, value) {
        // 2.2.5
        return handler(value);
    }

    /**
     * Resolve or reject a promise.
     * @private
     * @param  {Yaku} p
     * @param  {Integer} state
     * @param  {Any} value
     */
    function settlePromise (p, state, value) {
        var i = 0
        , len = p._pCount
        , p2;

        // 2.1.2
        // 2.1.3
        if (p._s === $pending) {
            // 2.1.1.1
            p._s = state;
            p._v = value;

            if (state === $rejected) {
                if (isLongStackTrace && isError(value)) {
                    value.longStack = genStackInfo(value, p);
                }

                scheduleUnhandledRejection(p);
            }

            // 2.2.4
            while (i < len) {
                p2 = p[i++];

                if (p2._s !== $pending) continue;

                scheduleHandler(p, p2);
            }
        }

        return p;
    }

    /**
     * Resolve or reject promise with value x. The x can also be a thenable.
     * @private
     * @param {Yaku} p
     * @param {Any | Thenable} x A normal value or a thenable.
     */
    function settleWithX (p, x) {
        // 2.3.1
        if (x === p && x) {
            settlePromise(p, $rejected, genTypeError($promiseCircularChain));
            return p;
        }

        // 2.3.2
        // 2.3.3
        if (x !== $null && (isFunction(x) || isObject(x))) {
            // 2.3.2.1
            var xthen = genTryCatcher(getThen)(x);

            if (xthen === $tryErr) {
                // 2.3.3.2
                settlePromise(p, $rejected, xthen.e);
                return p;
            }

            if (isFunction(xthen)) {
                if (isLongStackTrace && isYaku(x))
                    p._next = x;

                // Fix https://bugs.chromium.org/p/v8/issues/detail?id=4162
                if (isYaku(x))
                    settleXthen(p, x, xthen);
                else
                    Yaku.nextTick(function () {
                        settleXthen(p, x, xthen);
                    });
            } else
                // 2.3.3.4
                settlePromise(p, $resolved, x);
        } else
            // 2.3.4
            settlePromise(p, $resolved, x);

        return p;
    }

    /**
     * Try to get a promise's then method.
     * @private
     * @param  {Thenable} x
     * @return {Function}
     */
    function getThen (x) { return x.then; }

    /**
     * Resolve then with its promise.
     * @private
     * @param  {Yaku} p
     * @param  {Thenable} x
     * @param  {Function} xthen
     */
    function settleXthen (p, x, xthen) {
        // 2.3.3.3
        var err = genTryCatcher(xthen, x)(function (y) {
            // 2.3.3.3.3
            if (x) {
                x = $null;

                // 2.3.3.3.1
                settleWithX(p, y);
            }
        }, function (r) {
            // 2.3.3.3.3
            if (x) {
                x = $null;

                // 2.3.3.3.2
                settlePromise(p, $rejected, r);
            }
        });

        // 2.3.3.3.4.1
        if (err === $tryErr && x) {
            // 2.3.3.3.4.2
            settlePromise(p, $rejected, err.e);
            x = $null;
        }
    }

})();
