import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/web.self";
// An ambient self still exposes the statics the target needs.
declare const self: any;
export const value = self.Promise.withResolvers;