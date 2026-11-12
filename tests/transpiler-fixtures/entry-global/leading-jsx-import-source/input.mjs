/** @jsxImportSource custom-jsx
 * The next JSX compiler must import the configured runtime after polyfill injection.
 */
import "core-js/actual/array/at";
export const view = <box>{[1].at(0)}</box>;
