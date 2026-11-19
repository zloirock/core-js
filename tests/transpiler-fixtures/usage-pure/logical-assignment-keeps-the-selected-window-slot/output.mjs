import _self from "@core-js/pure/actual/self";
// The old left value can win. Its window is an actual property, also for update and delete.
export const read = (options.root ??= _self).window.document;
(options.root ||= _self).window.count++;
delete (options.root ??= _self).window.document;