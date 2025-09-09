var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-tbDjy0/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/worker.ts
function classify(logs) {
  const errorCount = logs.filter((log) => log.level === "ERROR" || log.level === "FATAL").length;
  const warnCount = logs.filter((log) => log.level === "WARN").length;
  if (errorCount > 0) return "critical";
  if (warnCount > 0) return "warning";
  return "info";
}
__name(classify, "classify");
function classifyTupik(data) {
  if (data.errorPattern) return "error_pattern";
  if (data.deadlock) return "deadlock";
  return "general";
}
__name(classifyTupik, "classifyTupik");
function buildPrompt(logs, classification) {
  return `Analyze the following logs and provide a detailed analysis with root cause analysis (RCA), fix suggestions, and configuration recommendations.
  
Classification: ${classification}
Logs:
${JSON.stringify(logs, null, 2)}

Please provide:
1. Root Cause Analysis (RCA)
2. Fix Suggestions
3. Configuration Recommendations`;
}
__name(buildPrompt, "buildPrompt");
function buildTupikPrompt(tupikData, classification) {
  return `Analyze the following deadlock/tupik situation and provide assistance to resolve it.
  
Classification: ${classification}
Tupik Data:
${JSON.stringify(tupikData, null, 2)}

Please provide:
1. Explanation of the deadlock situation
2. Root cause analysis
3. Instructions to resolve the deadlock
4. Prevention recommendations`;
}
__name(buildTupikPrompt, "buildTupikPrompt");
async function fetchGemini(prompt, apiKey) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });
  if (!response.ok) {
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }
  return await response.json();
}
__name(fetchGemini, "fetchGemini");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    if (method === "POST" && url.pathname === "/ingest/logs") {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 401 });
      }
      const token = authHeader.substring(7);
      let projectTokens = {};
      try {
        projectTokens = JSON.parse(env.PROJECT_TOKENS);
      } catch (e) {
        return new Response("Invalid PROJECT_TOKENS configuration", { status: 500 });
      }
      const projectId = Object.keys(projectTokens).find((key) => projectTokens[key] === token);
      if (!projectId) {
        return new Response("Invalid token", { status: 401 });
      }
      try {
        const logs = await request.json();
        const key = `logs/${projectId}/${Date.now()}.json`;
        await env.STORAGE.put(key, JSON.stringify(logs));
        console.log("\u041B\u043E\u0433\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B");
        return new Response(JSON.stringify({ success: true, key }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response("Error processing logs: " + error.message, { status: 500 });
      }
    }
    if (method === "POST" && url.pathname === "/analyze") {
      try {
        const requestData = await request.json();
        const logs = requestData.logs || [];
        const classification = classify(logs);
        const prompt = buildPrompt(logs, classification);
        const geminiResponse = await fetchGemini(prompt, env.GEMINI_API_KEY);
        return new Response(JSON.stringify({
          classification,
          analysis: geminiResponse
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response("Error analyzing logs: " + error.message, { status: 500 });
      }
    }
    if (method === "POST" && url.pathname === "/tupik/analyze") {
      try {
        const tupikData = await request.json();
        const classification = classifyTupik(tupikData);
        const prompt = buildTupikPrompt(tupikData, classification);
        return new Response(JSON.stringify({
          explanation: "\u042D\u0442\u043E\u0442 \u043F\u0440\u043E\u043C\u0442 \u0434\u043B\u044F \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u0430: \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0432 Grok!",
          instructionPrompt: prompt
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response("Error analyzing tupik: " + error.message, { status: 500 });
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};

// ../../../../opt/homebrew/Cellar/node/24.6.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../opt/homebrew/Cellar/node/24.6.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-tbDjy0/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../opt/homebrew/Cellar/node/24.6.0/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-tbDjy0/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
