export default function createServer({ lifecycle, fastify, log = error => fastify.log.error(error) }) {
  fastify.get('/status', { exposeHeadRoute: false }, () => lifecycle.status());

  fastify.get('/polyfills.js', { exposeHeadRoute: false }, async (request, reply) => {
    const response = reply.raw;
    if (!lifecycle.status().baselineReady) {
      reply.header('cache-control', 'no-store');
      return reply.code(503).send();
    }

    reply.hijack();
    try {
      await lifecycle.serveScript(request.raw, response);
    } catch (error) {
      try {
        log(error);
      } catch (loggingError) {
        try {
          process.stderr.write(`service container request failed: ${ error }; logging failed: ${ loggingError }\n`);
        } catch { /* The response still needs to be finished when both logging channels fail. */ }
      }
      if (response.headersSent) {
        response.destroy(error);
      } else {
        for (const name of response.getHeaderNames()) response.removeHeader(name);
        response.statusCode = 500;
        response.setHeader('cache-control', 'no-store');
        response.end();
      }
    }
  });

  return fastify;
}
