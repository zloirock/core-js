import createAdapter from './internals/ui/adapter/express.js';
import createService from './index.js';

export default function polyfillService(options) {
  const service = createService(options);
  const middleware = createAdapter(service);

  // the service the middleware runs on, because there is nowhere else to get it from: a status
  // endpoint, a second router or a warm-up started by hand would otherwise have to build a second
  // service, with a plan and a warm-up of its own
  middleware.service = service;

  return middleware;
}
