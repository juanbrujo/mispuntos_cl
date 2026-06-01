import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import require$$0, { hasInjectionContext, getCurrentInstance, inject, defineComponent, createElementBlock, shallowRef, provide, cloneVNode, h, useSSRContext, ref, createApp, mergeProps, computed, unref, withCtx, createTextVNode, watch, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, shallowReactive, reactive, effectScope, defineAsyncComponent, getCurrentScope, toRef, isReadonly, isRef, toValue, toRaw, isShallow, isReactive, nextTick } from 'vue';
import { t as parseURL, f as encodePath, d as decodePath, l as hasProtocol, o as isScriptProtocol, q as joinURL, z as withQuery, u as sanitizeStatusCode, g as getContext, $ as $fetch, c as createError$1, n as isEqual, m as hash, v as stringifyParsedURL, w as stringifyQuery, s as parseQuery, b as defu } from '../nitro/nitro.mjs';
import { u as useHead$1, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { debounce } from 'perfect-debounce';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrRenderComponent, ssrRenderSlot, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

function flatHooks(configHooks, hooks = {}, parentName) {
	for (const key in configHooks) {
		const subHook = configHooks[key];
		const name = parentName ? `${parentName}:${key}` : key;
		if (typeof subHook === "object" && subHook !== null) flatHooks(subHook, hooks, name);
		else if (typeof subHook === "function") hooks[name] = subHook;
	}
	return hooks;
}
const createTask = /* @__PURE__ */ (() => {
	if (console.createTask) return console.createTask;
	const defaultTask = { run: (fn) => fn() };
	return () => defaultTask;
})();
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
function serialTaskCaller(hooks, args, name) {
	if (hooks.length > 0) return callHooks(hooks, args, 0, createTask(name));
}
function parallelTaskCaller(hooks, args, name) {
	if (hooks.length > 0) {
		const task = createTask(name);
		return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
	}
}
function callEachWith(callbacks, arg0) {
	for (const callback of [...callbacks]) callback(arg0);
}
var Hookable = class {
	_hooks;
	_before;
	_after;
	_deprecatedHooks;
	_deprecatedMessages;
	constructor() {
		this._hooks = {};
		this._before = void 0;
		this._after = void 0;
		this._deprecatedMessages = void 0;
		this._deprecatedHooks = {};
		this.hook = this.hook.bind(this);
		this.callHook = this.callHook.bind(this);
		this.callHookWith = this.callHookWith.bind(this);
	}
	hook(name, function_, options = {}) {
		if (!name || typeof function_ !== "function") return () => {};
		const originalName = name;
		let dep;
		while (this._deprecatedHooks[name]) {
			dep = this._deprecatedHooks[name];
			name = dep.to;
		}
		if (dep && !options.allowDeprecated) {
			let message = dep.message;
			if (!message) message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
			if (!this._deprecatedMessages) this._deprecatedMessages = /* @__PURE__ */ new Set();
			if (!this._deprecatedMessages.has(message)) {
				console.warn(message);
				this._deprecatedMessages.add(message);
			}
		}
		if (!function_.name) try {
			Object.defineProperty(function_, "name", {
				get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
				configurable: true
			});
		} catch {}
		this._hooks[name] = this._hooks[name] || [];
		this._hooks[name].push(function_);
		return () => {
			if (function_) {
				this.removeHook(name, function_);
				function_ = void 0;
			}
		};
	}
	hookOnce(name, function_) {
		let _unreg;
		let _function = (...arguments_) => {
			if (typeof _unreg === "function") _unreg();
			_unreg = void 0;
			_function = void 0;
			return function_(...arguments_);
		};
		_unreg = this.hook(name, _function);
		return _unreg;
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	clearHook(name) {
		this._hooks[name] = void 0;
	}
	deprecateHook(name, deprecated) {
		this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
		const _hooks = this._hooks[name] || [];
		this._hooks[name] = void 0;
		for (const hook of _hooks) this.hook(name, hook);
	}
	deprecateHooks(deprecatedHooks) {
		for (const name in deprecatedHooks) this.deprecateHook(name, deprecatedHooks[name]);
	}
	addHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
		return () => {
			for (const unreg of removeFns) unreg();
			removeFns.length = 0;
		};
	}
	removeHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		for (const key in hooks) this.removeHook(key, hooks[key]);
	}
	removeAllHooks() {
		this._hooks = {};
	}
	callHook(name, ...args) {
		return this.callHookWith(serialTaskCaller, name, args);
	}
	callHookParallel(name, ...args) {
		return this.callHookWith(parallelTaskCaller, name, args);
	}
	callHookWith(caller, name, args) {
		const event = this._before || this._after ? {
			name,
			args,
			context: {}
		} : void 0;
		if (this._before) callEachWith(this._before, event);
		const result = caller(this._hooks[name] ? [...this._hooks[name]] : [], args, name);
		if (result instanceof Promise) return result.finally(() => {
			if (this._after && event) callEachWith(this._after, event);
		});
		if (this._after && event) callEachWith(this._after, event);
		return result;
	}
	beforeEach(function_) {
		this._before = this._before || [];
		this._before.push(function_);
		return () => {
			if (this._before !== void 0) {
				const index = this._before.indexOf(function_);
				if (index !== -1) this._before.splice(index, 1);
			}
		};
	}
	afterEach(function_) {
		this._after = this._after || [];
		this._after.push(function_);
		return () => {
			if (this._after !== void 0) {
				const index = this._after.indexOf(function_);
				if (index !== -1) this._after.splice(index, 1);
			}
		};
	}
};
function createHooks() {
	return new Hookable();
}

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "deep": false };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.4.6";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _state: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = encodeForHtmlAttr(location2);
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var pinia_prod = {};
var hasRequiredPinia_prod;
function requirePinia_prod() {
  if (hasRequiredPinia_prod) return pinia_prod;
  hasRequiredPinia_prod = 1;
  (function(exports) {
    var vue = require$$0;
    let activePinia;
    const setActivePinia = (pinia) => activePinia = pinia;
    const getActivePinia = () => vue.hasInjectionContext() && vue.inject(piniaSymbol) || activePinia;
    const piniaSymbol = (
      /* istanbul ignore next */
      /* @__PURE__ */ Symbol()
    );
    function isPlainObject(o) {
      return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
    }
    exports.MutationType = void 0;
    (function(MutationType) {
      MutationType["direct"] = "direct";
      MutationType["patchObject"] = "patch object";
      MutationType["patchFunction"] = "patch function";
    })(exports.MutationType || (exports.MutationType = {}));
    function createPinia() {
      const scope = vue.effectScope(true);
      const state = scope.run(() => vue.ref({}));
      let _p = [];
      let toBeInstalled = [];
      const pinia = vue.markRaw({
        install(app) {
          setActivePinia(pinia);
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          toBeInstalled.forEach((plugin2) => _p.push(plugin2));
          toBeInstalled = [];
        },
        use(plugin2) {
          if (!this._a) {
            toBeInstalled.push(plugin2);
          } else {
            _p.push(plugin2);
          }
          return this;
        },
        _p,
        // it's actually undefined here
        // @ts-expect-error
        _a: null,
        _e: scope,
        _s: /* @__PURE__ */ new Map(),
        state
      });
      return pinia;
    }
    function disposePinia(pinia) {
      pinia._e.stop();
      pinia._s.clear();
      pinia._p.splice(0);
      pinia.state.value = {};
      pinia._a = null;
    }
    function acceptHMRUpdate(initialUseStore, hot) {
      {
        return () => {
        };
      }
    }
    const noop = () => {
    };
    function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
      subscriptions.add(callback);
      const removeSubscription = () => {
        const isDel = subscriptions.delete(callback);
        isDel && onCleanup();
      };
      if (!detached && vue.getCurrentScope()) {
        vue.onScopeDispose(removeSubscription);
      }
      return removeSubscription;
    }
    function triggerSubscriptions(subscriptions, ...args) {
      subscriptions.forEach((callback) => {
        callback(...args);
      });
    }
    const fallbackRunWithContext = (fn) => fn();
    const ACTION_MARKER = /* @__PURE__ */ Symbol();
    const ACTION_NAME = /* @__PURE__ */ Symbol();
    function mergeReactiveObjects(target, patchToApply) {
      if (target instanceof Map && patchToApply instanceof Map) {
        patchToApply.forEach((value, key) => target.set(key, value));
      } else if (target instanceof Set && patchToApply instanceof Set) {
        patchToApply.forEach(target.add, target);
      }
      for (const key in patchToApply) {
        if (!patchToApply.hasOwnProperty(key))
          continue;
        const subPatch = patchToApply[key];
        const targetValue = target[key];
        if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
          target[key] = mergeReactiveObjects(targetValue, subPatch);
        } else {
          target[key] = subPatch;
        }
      }
      return target;
    }
    const skipHydrateSymbol = (
      /* istanbul ignore next */
      /* @__PURE__ */ Symbol()
    );
    function skipHydrate(obj) {
      return Object.defineProperty(obj, skipHydrateSymbol, {});
    }
    function shouldHydrate(obj) {
      return !isPlainObject(obj) || !Object.prototype.hasOwnProperty.call(obj, skipHydrateSymbol);
    }
    const { assign } = Object;
    function isComputed(o) {
      return !!(vue.isRef(o) && o.effect);
    }
    function createOptionsStore(id, options, pinia, hot) {
      const { state, actions, getters } = options;
      const initialState = pinia.state.value[id];
      let store;
      function setup() {
        if (!initialState && true) {
          pinia.state.value[id] = state ? state() : {};
        }
        const localState = vue.toRefs(pinia.state.value[id]);
        return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
          computedGetters[name] = vue.markRaw(vue.computed(() => {
            setActivePinia(pinia);
            const store2 = pinia._s.get(id);
            return getters[name].call(store2, store2);
          }));
          return computedGetters;
        }, {}));
      }
      store = createSetupStore(id, setup, options, pinia, hot, true);
      return store;
    }
    function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
      let scope;
      const optionsForPlugin = assign({ actions: {} }, options);
      const $subscribeOptions = { deep: true };
      let isListening;
      let isSyncListening;
      let subscriptions = /* @__PURE__ */ new Set();
      let actionSubscriptions = /* @__PURE__ */ new Set();
      let debuggerEvents;
      const initialState = pinia.state.value[$id];
      if (!isOptionsStore && !initialState && true) {
        pinia.state.value[$id] = {};
      }
      vue.ref({});
      let activeListener;
      function $patch(partialStateOrMutator) {
        let subscriptionMutation;
        isListening = isSyncListening = false;
        if (typeof partialStateOrMutator === "function") {
          partialStateOrMutator(pinia.state.value[$id]);
          subscriptionMutation = {
            type: exports.MutationType.patchFunction,
            storeId: $id,
            events: debuggerEvents
          };
        } else {
          mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
          subscriptionMutation = {
            type: exports.MutationType.patchObject,
            payload: partialStateOrMutator,
            storeId: $id,
            events: debuggerEvents
          };
        }
        const myListenerId = activeListener = /* @__PURE__ */ Symbol();
        vue.nextTick().then(() => {
          if (activeListener === myListenerId) {
            isListening = true;
          }
        });
        isSyncListening = true;
        triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
      }
      const $reset = isOptionsStore ? function $reset2() {
        const { state } = options;
        const newState = state ? state() : {};
        this.$patch(($state) => {
          assign($state, newState);
        });
      } : (
        /* istanbul ignore next */
        noop
      );
      function $dispose() {
        scope.stop();
        subscriptions.clear();
        actionSubscriptions.clear();
        pinia._s.delete($id);
      }
      const action = (fn, name = "") => {
        if (ACTION_MARKER in fn) {
          fn[ACTION_NAME] = name;
          return fn;
        }
        const wrappedAction = function() {
          setActivePinia(pinia);
          const args = Array.from(arguments);
          const afterCallbackSet = /* @__PURE__ */ new Set();
          const onErrorCallbackSet = /* @__PURE__ */ new Set();
          function after(callback) {
            afterCallbackSet.add(callback);
          }
          function onError(callback) {
            onErrorCallbackSet.add(callback);
          }
          triggerSubscriptions(actionSubscriptions, {
            args,
            name: wrappedAction[ACTION_NAME],
            store,
            after,
            onError
          });
          let ret;
          try {
            ret = fn.apply(this && this.$id === $id ? this : store, args);
          } catch (error) {
            triggerSubscriptions(onErrorCallbackSet, error);
            throw error;
          }
          if (ret instanceof Promise) {
            return ret.then((value) => {
              triggerSubscriptions(afterCallbackSet, value);
              return value;
            }).catch((error) => {
              triggerSubscriptions(onErrorCallbackSet, error);
              return Promise.reject(error);
            });
          }
          triggerSubscriptions(afterCallbackSet, ret);
          return ret;
        };
        wrappedAction[ACTION_MARKER] = true;
        wrappedAction[ACTION_NAME] = name;
        return wrappedAction;
      };
      const partialStore = {
        _p: pinia,
        // _s: scope,
        $id,
        $onAction: addSubscription.bind(null, actionSubscriptions),
        $patch,
        $reset,
        $subscribe(callback, options2 = {}) {
          const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
          const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
            if (options2.flush === "sync" ? isSyncListening : isListening) {
              callback({
                storeId: $id,
                type: exports.MutationType.direct,
                events: debuggerEvents
              }, state);
            }
          }, assign({}, $subscribeOptions, options2)));
          return removeSubscription;
        },
        $dispose
      };
      const store = vue.reactive(partialStore);
      pinia._s.set($id, store);
      const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
      const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(() => setup({ action }))));
      for (const key in setupStore) {
        const prop = setupStore[key];
        if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
          if (!isOptionsStore) {
            if (initialState && shouldHydrate(prop)) {
              if (vue.isRef(prop)) {
                prop.value = initialState[key];
              } else {
                mergeReactiveObjects(prop, initialState[key]);
              }
            }
            pinia.state.value[$id][key] = prop;
          }
        } else if (typeof prop === "function") {
          const actionValue = action(prop, key);
          setupStore[key] = actionValue;
          optionsForPlugin.actions[key] = prop;
        } else ;
      }
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
      Object.defineProperty(store, "$state", {
        get: () => pinia.state.value[$id],
        set: (state) => {
          $patch(($state) => {
            assign($state, state);
          });
        }
      });
      pinia._p.forEach((extender) => {
        {
          assign(store, scope.run(() => extender({
            store,
            app: pinia._a,
            pinia,
            options: optionsForPlugin
          })));
        }
      });
      if (initialState && isOptionsStore && options.hydrate) {
        options.hydrate(store.$state, initialState);
      }
      isListening = true;
      isSyncListening = true;
      return store;
    }
    // @__NO_SIDE_EFFECTS__
    function defineStore(id, setup, setupOptions) {
      let options;
      const isSetupStore = typeof setup === "function";
      options = isSetupStore ? setupOptions : setup;
      function useStore(pinia, hot) {
        const hasContext = vue.hasInjectionContext();
        pinia = // in test mode, ignore the argument provided as we can always retrieve a
        // pinia instance with getActivePinia()
        (pinia) || (hasContext ? vue.inject(piniaSymbol, null) : null);
        if (pinia)
          setActivePinia(pinia);
        pinia = activePinia;
        if (!pinia._s.has(id)) {
          if (isSetupStore) {
            createSetupStore(id, setup, options, pinia);
          } else {
            createOptionsStore(id, options, pinia);
          }
        }
        const store = pinia._s.get(id);
        return store;
      }
      useStore.$id = id;
      return useStore;
    }
    let mapStoreSuffix = "Store";
    function setMapStoreSuffix(suffix) {
      mapStoreSuffix = suffix;
    }
    function mapStores(...stores) {
      return stores.reduce((reduced, useStore) => {
        reduced[useStore.$id + mapStoreSuffix] = function() {
          return useStore(this.$pinia);
        };
        return reduced;
      }, {});
    }
    function mapState(useStore, keysOrMapper) {
      return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
        reduced[key] = function() {
          return useStore(this.$pinia)[key];
        };
        return reduced;
      }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
        reduced[key] = function() {
          const store = useStore(this.$pinia);
          const storeKey = keysOrMapper[key];
          return typeof storeKey === "function" ? storeKey.call(this, store) : (
            // @ts-expect-error: FIXME: should work?
            store[storeKey]
          );
        };
        return reduced;
      }, {});
    }
    const mapGetters = mapState;
    function mapActions(useStore, keysOrMapper) {
      return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
        reduced[key] = function(...args) {
          return useStore(this.$pinia)[key](...args);
        };
        return reduced;
      }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
        reduced[key] = function(...args) {
          return useStore(this.$pinia)[keysOrMapper[key]](...args);
        };
        return reduced;
      }, {});
    }
    function mapWritableState(useStore, keysOrMapper) {
      return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
        reduced[key] = {
          get() {
            return useStore(this.$pinia)[key];
          },
          set(value) {
            return useStore(this.$pinia)[key] = value;
          }
        };
        return reduced;
      }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
        reduced[key] = {
          get() {
            return useStore(this.$pinia)[keysOrMapper[key]];
          },
          set(value) {
            return useStore(this.$pinia)[keysOrMapper[key]] = value;
          }
        };
        return reduced;
      }, {});
    }
    function storeToRefs(store) {
      const rawStore = vue.toRaw(store);
      const refs = {};
      for (const key in rawStore) {
        const value = rawStore[key];
        if (value.effect) {
          refs[key] = // ...
          vue.computed({
            get: () => store[key],
            set(value2) {
              store[key] = value2;
            }
          });
        } else if (vue.isRef(value) || vue.isReactive(value)) {
          refs[key] = // ---
          vue.toRef(store, key);
        }
      }
      return refs;
    }
    exports.acceptHMRUpdate = acceptHMRUpdate;
    exports.createPinia = createPinia;
    exports.defineStore = defineStore;
    exports.disposePinia = disposePinia;
    exports.getActivePinia = getActivePinia;
    exports.mapActions = mapActions;
    exports.mapGetters = mapGetters;
    exports.mapState = mapState;
    exports.mapStores = mapStores;
    exports.mapWritableState = mapWritableState;
    exports.setActivePinia = setActivePinia;
    exports.setMapStoreSuffix = setMapStoreSuffix;
    exports.shouldHydrate = shouldHydrate;
    exports.skipHydrate = skipHydrate;
    exports.storeToRefs = storeToRefs;
  })(pinia_prod);
  return pinia_prod;
}
var pinia_prodExports = /* @__PURE__ */ requirePinia_prod();
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || useNuxtApp();
  return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      const head = inject(headSymbol);
      if (!head) {
        throw new Error("[nuxt] [unhead] Missing Unhead instance.");
      }
      return head;
    }
  });
}
function useHead(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useHead$1(input, { head, ...options });
}
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher().map((r) => r.data).reverse());
const routeRulesMatcher = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !pinia_prodExports.shouldHydrate(data) && 1
  );
});
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_IWq_ShTzHMH4qtylEUccNKr8YvUuLLYneiEzQ81VSlM = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  const route = fullPath && typeof fullPath === "object" ? fullPath : {};
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: void 0,
    matched: route.matched || [],
    redirectedFrom: void 0,
    meta: route.meta || {},
    href: fullPath
  };
}
const router_vfVI2BKuynxAmlCPicRMU673SIE8l8VxlaS9HbspBC4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return await handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          const route2 = router.resolve(props.to);
          return props.custom ? slots.default?.({ href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    const initialLayoutProps = nuxtApp.payload.state._layoutProps;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
          to.meta.layoutProps = initialLayoutProps;
        }
        nuxtApp._processingMiddleware = true;
        if (!nuxtApp.ssrContext?.islandContext) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          const routeRules = getRouteRules({ path: to.path });
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              const guard = nuxtApp._middleware.named[key];
              if (!guard) {
                continue;
              }
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(guard);
              } else {
                middlewareEntries.delete(guard);
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_UihyQxYp0qCsq6rGIfnlBz_xJE_uKBgiz3hnzE0umhY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
var shared_cjs_prod = {};
var hasRequiredShared_cjs_prod;
function requireShared_cjs_prod() {
  if (hasRequiredShared_cjs_prod) return shared_cjs_prod;
  hasRequiredShared_cjs_prod = 1;
  Object.defineProperty(shared_cjs_prod, "__esModule", { value: true });
  // @__NO_SIDE_EFFECTS__
  function makeMap(str) {
    const map = /* @__PURE__ */ Object.create(null);
    for (const key of str.split(",")) map[key] = 1;
    return (val) => val in map;
  }
  const EMPTY_OBJ = {};
  const EMPTY_ARR = [];
  const NOOP = () => {
  };
  const NO = () => false;
  const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
  (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
  const isModelListener = (key) => key.startsWith("onUpdate:");
  const extend = Object.assign;
  const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
      arr.splice(i, 1);
    }
  };
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const isArray = Array.isArray;
  const isMap = (val) => toTypeString(val) === "[object Map]";
  const isSet = (val) => toTypeString(val) === "[object Set]";
  const isDate = (val) => toTypeString(val) === "[object Date]";
  const isRegExp = (val) => toTypeString(val) === "[object RegExp]";
  const isFunction = (val) => typeof val === "function";
  const isString = (val) => typeof val === "string";
  const isSymbol = (val) => typeof val === "symbol";
  const isObject = (val) => val !== null && typeof val === "object";
  const isPromise = (val) => {
    return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
  };
  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  const isPlainObject = (val) => toTypeString(val) === "[object Object]";
  const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  const isReservedProp = /* @__PURE__ */ makeMap(
    // the leading comma is intentional so empty string "" is also included
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  );
  const isBuiltInDirective = /* @__PURE__ */ makeMap(
    "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
  );
  const cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return ((str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    });
  };
  const camelizeRE = /-\w/g;
  const camelize = cacheStringFunction(
    (str) => {
      return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
    }
  );
  const hyphenateRE = /\B([A-Z])/g;
  const hyphenate = cacheStringFunction(
    (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
  );
  const capitalize = cacheStringFunction((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  const toHandlerKey = cacheStringFunction(
    (str) => {
      const s = str ? `on${capitalize(str)}` : ``;
      return s;
    }
  );
  const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
  const invokeArrayFns = (fns, ...arg) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i](...arg);
    }
  };
  const def = (obj, key, value, writable = false) => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: false,
      writable,
      value
    });
  };
  const looseToNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  };
  const toNumber = (val) => {
    const n = isString(val) ? Number(val) : NaN;
    return isNaN(n) ? val : n;
  };
  let _globalThis;
  const getGlobalThis = () => {
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : {});
  };
  const identRE = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
  function genPropsAccessExp(name) {
    return identRE.test(name) ? `__props.${name}` : `__props[${JSON.stringify(name)}]`;
  }
  function genCacheKey(source, options) {
    return source + JSON.stringify(
      options,
      (_, val) => typeof val === "function" ? val.toString() : val
    );
  }
  const PatchFlags = {
    "TEXT": 1,
    "1": "TEXT",
    "CLASS": 2,
    "2": "CLASS",
    "STYLE": 4,
    "4": "STYLE",
    "PROPS": 8,
    "8": "PROPS",
    "FULL_PROPS": 16,
    "16": "FULL_PROPS",
    "NEED_HYDRATION": 32,
    "32": "NEED_HYDRATION",
    "STABLE_FRAGMENT": 64,
    "64": "STABLE_FRAGMENT",
    "KEYED_FRAGMENT": 128,
    "128": "KEYED_FRAGMENT",
    "UNKEYED_FRAGMENT": 256,
    "256": "UNKEYED_FRAGMENT",
    "NEED_PATCH": 512,
    "512": "NEED_PATCH",
    "DYNAMIC_SLOTS": 1024,
    "1024": "DYNAMIC_SLOTS",
    "DEV_ROOT_FRAGMENT": 2048,
    "2048": "DEV_ROOT_FRAGMENT",
    "CACHED": -1,
    "-1": "CACHED",
    "BAIL": -2,
    "-2": "BAIL"
  };
  const PatchFlagNames = {
    [1]: `TEXT`,
    [2]: `CLASS`,
    [4]: `STYLE`,
    [8]: `PROPS`,
    [16]: `FULL_PROPS`,
    [32]: `NEED_HYDRATION`,
    [64]: `STABLE_FRAGMENT`,
    [128]: `KEYED_FRAGMENT`,
    [256]: `UNKEYED_FRAGMENT`,
    [512]: `NEED_PATCH`,
    [1024]: `DYNAMIC_SLOTS`,
    [2048]: `DEV_ROOT_FRAGMENT`,
    [-1]: `CACHED`,
    [-2]: `BAIL`
  };
  const ShapeFlags = {
    "ELEMENT": 1,
    "1": "ELEMENT",
    "FUNCTIONAL_COMPONENT": 2,
    "2": "FUNCTIONAL_COMPONENT",
    "STATEFUL_COMPONENT": 4,
    "4": "STATEFUL_COMPONENT",
    "TEXT_CHILDREN": 8,
    "8": "TEXT_CHILDREN",
    "ARRAY_CHILDREN": 16,
    "16": "ARRAY_CHILDREN",
    "SLOTS_CHILDREN": 32,
    "32": "SLOTS_CHILDREN",
    "TELEPORT": 64,
    "64": "TELEPORT",
    "SUSPENSE": 128,
    "128": "SUSPENSE",
    "COMPONENT_SHOULD_KEEP_ALIVE": 256,
    "256": "COMPONENT_SHOULD_KEEP_ALIVE",
    "COMPONENT_KEPT_ALIVE": 512,
    "512": "COMPONENT_KEPT_ALIVE",
    "COMPONENT": 6,
    "6": "COMPONENT"
  };
  const SlotFlags = {
    "STABLE": 1,
    "1": "STABLE",
    "DYNAMIC": 2,
    "2": "DYNAMIC",
    "FORWARDED": 3,
    "3": "FORWARDED"
  };
  const slotFlagsText = {
    [1]: "STABLE",
    [2]: "DYNAMIC",
    [3]: "FORWARDED"
  };
  const GLOBALS_ALLOWED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol";
  const isGloballyAllowed = /* @__PURE__ */ makeMap(GLOBALS_ALLOWED);
  const isGloballyWhitelisted = isGloballyAllowed;
  const range = 2;
  function generateCodeFrame(source, start = 0, end = source.length) {
    start = Math.max(0, Math.min(start, source.length));
    end = Math.max(0, Math.min(end, source.length));
    if (start > end) return "";
    let lines = source.split(/(\r?\n)/);
    const newlineSequences = lines.filter((_, idx) => idx % 2 === 1);
    lines = lines.filter((_, idx) => idx % 2 === 0);
    let count = 0;
    const res = [];
    for (let i = 0; i < lines.length; i++) {
      count += lines[i].length + (newlineSequences[i] && newlineSequences[i].length || 0);
      if (count >= start) {
        for (let j = i - range; j <= i + range || end > count; j++) {
          if (j < 0 || j >= lines.length) continue;
          const line = j + 1;
          res.push(
            `${line}${" ".repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`
          );
          const lineLength = lines[j].length;
          const newLineSeqLength = newlineSequences[j] && newlineSequences[j].length || 0;
          if (j === i) {
            const pad = start - (count - (lineLength + newLineSeqLength));
            const length = Math.max(
              1,
              end > count ? lineLength - pad : end - start
            );
            res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
          } else if (j > i) {
            if (end > count) {
              const length = Math.max(Math.min(end - count, lineLength), 1);
              res.push(`   |  ` + "^".repeat(length));
            }
            count += lineLength + newLineSeqLength;
          }
        }
        break;
      }
    }
    return res.join("\n");
  }
  function normalizeStyle(value) {
    if (isArray(value)) {
      const res = {};
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
        if (normalized) {
          for (const key in normalized) {
            res[key] = normalized[key];
          }
        }
      }
      return res;
    } else if (isString(value) || isObject(value)) {
      return value;
    }
  }
  const listDelimiterRE = /;(?![^(]*\))/g;
  const propertyDelimiterRE = /:([^]+)/;
  const styleCommentRE = /\/\*[^]*?\*\//g;
  function parseStringStyle(cssText) {
    const ret = {};
    cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
      if (item) {
        const tmp = item.split(propertyDelimiterRE);
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return ret;
  }
  function stringifyStyle(styles) {
    if (!styles) return "";
    if (isString(styles)) return styles;
    let ret = "";
    for (const key in styles) {
      const value = styles[key];
      if (isString(value) || typeof value === "number") {
        const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
        ret += `${normalizedKey}:${value};`;
      }
    }
    return ret;
  }
  function normalizeClass(value) {
    let res = "";
    if (isString(value)) {
      res = value;
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const normalized = normalizeClass(value[i]);
        if (normalized) {
          res += normalized + " ";
        }
      }
    } else if (isObject(value)) {
      for (const name in value) {
        if (value[name]) {
          res += name + " ";
        }
      }
    }
    return res.trim();
  }
  function normalizeProps(props) {
    if (!props) return null;
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (style) {
      props.style = normalizeStyle(style);
    }
    return props;
  }
  const HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
  const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
  const MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
  const VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
  const isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
  const isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
  const isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
  const isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);
  const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
  const isBooleanAttr = /* @__PURE__ */ makeMap(
    specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
  );
  function includeBooleanAttr(value) {
    return !!value || value === "";
  }
  const unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
  const attrValidationCache = {};
  function isSSRSafeAttrName(name) {
    if (attrValidationCache.hasOwnProperty(name)) {
      return attrValidationCache[name];
    }
    const isUnsafe = unsafeAttrCharRE.test(name);
    if (isUnsafe) {
      console.error(`unsafe attribute name: ${name}`);
    }
    return attrValidationCache[name] = !isUnsafe;
  }
  const propsToAttrMap = {
    acceptCharset: "accept-charset",
    className: "class",
    htmlFor: "for",
    httpEquiv: "http-equiv"
  };
  const isKnownHtmlAttr = /* @__PURE__ */ makeMap(
    `accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,inert,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap`
  );
  const isKnownSvgAttr = /* @__PURE__ */ makeMap(
    `xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xmlns:xlink,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan`
  );
  const isKnownMathMLAttr = /* @__PURE__ */ makeMap(
    `accent,accentunder,actiontype,align,alignmentscope,altimg,altimg-height,altimg-valign,altimg-width,alttext,bevelled,close,columnsalign,columnlines,columnspan,denomalign,depth,dir,display,displaystyle,encoding,equalcolumns,equalrows,fence,fontstyle,fontweight,form,frame,framespacing,groupalign,height,href,id,indentalign,indentalignfirst,indentalignlast,indentshift,indentshiftfirst,indentshiftlast,indextype,justify,largetop,largeop,lquote,lspace,mathbackground,mathcolor,mathsize,mathvariant,maxsize,minlabelspacing,mode,other,overflow,position,rowalign,rowlines,rowspan,rquote,rspace,scriptlevel,scriptminsize,scriptsizemultiplier,selection,separator,separators,shift,side,src,stackalign,stretchy,subscriptshift,superscriptshift,symmetric,voffset,width,widths,xlink:href,xlink:show,xlink:type,xmlns`
  );
  function isRenderableAttrValue(value) {
    if (value == null) {
      return false;
    }
    const type = typeof value;
    return type === "string" || type === "number" || type === "boolean";
  }
  const escapeRE = /["'&<>]/;
  function escapeHtml(string) {
    const str = "" + string;
    const match = escapeRE.exec(str);
    if (!match) {
      return str;
    }
    let html = "";
    let escaped;
    let index;
    let lastIndex = 0;
    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34:
          escaped = "&quot;";
          break;
        case 38:
          escaped = "&amp;";
          break;
        case 39:
          escaped = "&#39;";
          break;
        case 60:
          escaped = "&lt;";
          break;
        case 62:
          escaped = "&gt;";
          break;
        default:
          continue;
      }
      if (lastIndex !== index) {
        html += str.slice(lastIndex, index);
      }
      lastIndex = index + 1;
      html += escaped;
    }
    return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
  }
  const commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
  function escapeHtmlComment(src) {
    return src.replace(commentStripRE, "");
  }
  const cssVarNameEscapeSymbolsRE = /[ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;
  function getEscapedCssVarName(key, doubleEscape) {
    return key.replace(
      cssVarNameEscapeSymbolsRE,
      (s) => doubleEscape ? s === '"' ? '\\\\\\"' : `\\\\${s}` : `\\${s}`
    );
  }
  function looseCompareArrays(a, b) {
    if (a.length !== b.length) return false;
    let equal = true;
    for (let i = 0; equal && i < a.length; i++) {
      equal = looseEqual(a[i], b[i]);
    }
    return equal;
  }
  function looseEqual(a, b) {
    if (a === b) return true;
    let aValidType = isDate(a);
    let bValidType = isDate(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    }
    aValidType = isSymbol(a);
    bValidType = isSymbol(b);
    if (aValidType || bValidType) {
      return a === b;
    }
    aValidType = isArray(a);
    bValidType = isArray(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareArrays(a, b) : false;
    }
    aValidType = isObject(a);
    bValidType = isObject(b);
    if (aValidType || bValidType) {
      if (!aValidType || !bValidType) {
        return false;
      }
      const aKeysCount = Object.keys(a).length;
      const bKeysCount = Object.keys(b).length;
      if (aKeysCount !== bKeysCount) {
        return false;
      }
      for (const key in a) {
        const aHasKey = a.hasOwnProperty(key);
        const bHasKey = b.hasOwnProperty(key);
        if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
          return false;
        }
      }
    }
    return String(a) === String(b);
  }
  function looseIndexOf(arr, val) {
    return arr.findIndex((item) => looseEqual(item, val));
  }
  const isRef2 = (val) => {
    return !!(val && val["__v_isRef"] === true);
  };
  const toDisplayString = (val) => {
    return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef2(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
  };
  const replacer = (_key, val) => {
    if (isRef2(val)) {
      return replacer(_key, val.value);
    } else if (isMap(val)) {
      return {
        [`Map(${val.size})`]: [...val.entries()].reduce(
          (entries, [key, val2], i) => {
            entries[stringifySymbol(key, i) + " =>"] = val2;
            return entries;
          },
          {}
        )
      };
    } else if (isSet(val)) {
      return {
        [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
      };
    } else if (isSymbol(val)) {
      return stringifySymbol(val);
    } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
      return String(val);
    }
    return val;
  };
  const stringifySymbol = (v, i = "") => {
    var _a;
    return (
      // Symbol.description in es2019+ so we need to cast here to pass
      // the lib: es2016 check
      isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
    );
  };
  function normalizeCssVarValue(value) {
    if (value == null) {
      return "initial";
    }
    if (typeof value === "string") {
      return value === "" ? " " : value;
    }
    return String(value);
  }
  shared_cjs_prod.EMPTY_ARR = EMPTY_ARR;
  shared_cjs_prod.EMPTY_OBJ = EMPTY_OBJ;
  shared_cjs_prod.NO = NO;
  shared_cjs_prod.NOOP = NOOP;
  shared_cjs_prod.PatchFlagNames = PatchFlagNames;
  shared_cjs_prod.PatchFlags = PatchFlags;
  shared_cjs_prod.ShapeFlags = ShapeFlags;
  shared_cjs_prod.SlotFlags = SlotFlags;
  shared_cjs_prod.camelize = camelize;
  shared_cjs_prod.capitalize = capitalize;
  shared_cjs_prod.cssVarNameEscapeSymbolsRE = cssVarNameEscapeSymbolsRE;
  shared_cjs_prod.def = def;
  shared_cjs_prod.escapeHtml = escapeHtml;
  shared_cjs_prod.escapeHtmlComment = escapeHtmlComment;
  shared_cjs_prod.extend = extend;
  shared_cjs_prod.genCacheKey = genCacheKey;
  shared_cjs_prod.genPropsAccessExp = genPropsAccessExp;
  shared_cjs_prod.generateCodeFrame = generateCodeFrame;
  shared_cjs_prod.getEscapedCssVarName = getEscapedCssVarName;
  shared_cjs_prod.getGlobalThis = getGlobalThis;
  shared_cjs_prod.hasChanged = hasChanged;
  shared_cjs_prod.hasOwn = hasOwn;
  shared_cjs_prod.hyphenate = hyphenate;
  shared_cjs_prod.includeBooleanAttr = includeBooleanAttr;
  shared_cjs_prod.invokeArrayFns = invokeArrayFns;
  shared_cjs_prod.isArray = isArray;
  shared_cjs_prod.isBooleanAttr = isBooleanAttr;
  shared_cjs_prod.isBuiltInDirective = isBuiltInDirective;
  shared_cjs_prod.isDate = isDate;
  shared_cjs_prod.isFunction = isFunction;
  shared_cjs_prod.isGloballyAllowed = isGloballyAllowed;
  shared_cjs_prod.isGloballyWhitelisted = isGloballyWhitelisted;
  shared_cjs_prod.isHTMLTag = isHTMLTag;
  shared_cjs_prod.isIntegerKey = isIntegerKey;
  shared_cjs_prod.isKnownHtmlAttr = isKnownHtmlAttr;
  shared_cjs_prod.isKnownMathMLAttr = isKnownMathMLAttr;
  shared_cjs_prod.isKnownSvgAttr = isKnownSvgAttr;
  shared_cjs_prod.isMap = isMap;
  shared_cjs_prod.isMathMLTag = isMathMLTag;
  shared_cjs_prod.isModelListener = isModelListener;
  shared_cjs_prod.isObject = isObject;
  shared_cjs_prod.isOn = isOn;
  shared_cjs_prod.isPlainObject = isPlainObject;
  shared_cjs_prod.isPromise = isPromise;
  shared_cjs_prod.isRegExp = isRegExp;
  shared_cjs_prod.isRenderableAttrValue = isRenderableAttrValue;
  shared_cjs_prod.isReservedProp = isReservedProp;
  shared_cjs_prod.isSSRSafeAttrName = isSSRSafeAttrName;
  shared_cjs_prod.isSVGTag = isSVGTag;
  shared_cjs_prod.isSet = isSet;
  shared_cjs_prod.isSpecialBooleanAttr = isSpecialBooleanAttr;
  shared_cjs_prod.isString = isString;
  shared_cjs_prod.isSymbol = isSymbol;
  shared_cjs_prod.isVoidTag = isVoidTag;
  shared_cjs_prod.looseEqual = looseEqual;
  shared_cjs_prod.looseIndexOf = looseIndexOf;
  shared_cjs_prod.looseToNumber = looseToNumber;
  shared_cjs_prod.makeMap = makeMap;
  shared_cjs_prod.normalizeClass = normalizeClass;
  shared_cjs_prod.normalizeCssVarValue = normalizeCssVarValue;
  shared_cjs_prod.normalizeProps = normalizeProps;
  shared_cjs_prod.normalizeStyle = normalizeStyle;
  shared_cjs_prod.objectToString = objectToString;
  shared_cjs_prod.parseStringStyle = parseStringStyle;
  shared_cjs_prod.propsToAttrMap = propsToAttrMap;
  shared_cjs_prod.remove = remove;
  shared_cjs_prod.slotFlagsText = slotFlagsText;
  shared_cjs_prod.stringifyStyle = stringifyStyle;
  shared_cjs_prod.toDisplayString = toDisplayString;
  shared_cjs_prod.toHandlerKey = toHandlerKey;
  shared_cjs_prod.toNumber = toNumber;
  shared_cjs_prod.toRawType = toRawType;
  shared_cjs_prod.toTypeString = toTypeString;
  return shared_cjs_prod;
}
var shared_cjs_prodExports = /* @__PURE__ */ requireShared_cjs_prod();
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
const __nuxt_component_0 = defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function defineKeyedFunctionFactory(factory) {
  const placeholder = function() {
    throw new Error(`[nuxt] \`${factory.name}\` is a compiler macro and cannot be called at runtime.`);
  };
  return Object.defineProperty(placeholder, "__nuxt_factory", {
    enumerable: false,
    get: () => factory.factory
  });
}
const createUseAsyncData = defineKeyedFunctionFactory({
  name: "createUseAsyncData",
  factory(options = {}) {
    function useAsyncData2(...args) {
      const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
      if (_isAutoKeyNeeded(args[0], args[1])) {
        args.unshift(autoKey);
      }
      let [_key, _handler, opts = {}] = args;
      const isKeyReactive = isRef(_key) || typeof _key === "function";
      const key = isKeyReactive ? computed(() => toValue(_key)) : { value: _key };
      if (!key.value || typeof key.value !== "string") {
        throw new TypeError("[nuxt] [useAsyncData] key must be a non-empty string.");
      }
      if (typeof _handler !== "function") {
        throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");
      }
      const shouldFactoryOptionsOverride = typeof options === "function";
      const nuxtApp = useNuxtApp();
      const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
      if (!shouldFactoryOptionsOverride) {
        for (const key2 in factoryOptions) {
          if (factoryOptions[key2] === void 0) {
            continue;
          }
          if (opts[key2] !== void 0) {
            continue;
          }
          opts[key2] = factoryOptions[key2];
        }
      }
      opts.server ??= true;
      opts.default ??= getDefault;
      opts.getCachedData ??= getDefaultCachedData;
      opts.lazy ??= false;
      opts.immediate ??= true;
      opts.deep ??= asyncDataDefaults.deep;
      opts.dedupe ??= "cancel";
      if (shouldFactoryOptionsOverride) {
        for (const key2 in factoryOptions) {
          if (factoryOptions[key2] === void 0) {
            continue;
          }
          opts[key2] = factoryOptions[key2];
        }
      }
      nuxtApp._asyncData[key.value];
      function createInitialFetch() {
        const initialFetchOptions = { cause: "initial", dedupe: opts.dedupe };
        const existing = nuxtApp._asyncData[key.value];
        if (!existing?._init) {
          initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
          nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
          nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
        } else {
          initialFetchOptions.cachedData = existing._initialCachedData;
        }
        return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
      }
      const initialFetch = createInitialFetch();
      const asyncData = nuxtApp._asyncData[key.value];
      asyncData._deps++;
      const fetchOnServer = opts.server !== false && nuxtApp.payload.serverRendered;
      if (fetchOnServer && opts.immediate) {
        const promise = initialFetch();
        if (getCurrentInstance()) {
          onServerPrefetch(() => promise);
        } else {
          nuxtApp.hook("app:created", async () => {
            await promise;
          });
        }
      }
      const asyncReturn = {
        data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
        pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
        status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
        error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
        refresh: (...args2) => {
          if (!nuxtApp._asyncData[key.value]?._init) {
            const initialFetch2 = createInitialFetch();
            return initialFetch2();
          }
          return nuxtApp._asyncData[key.value].execute(...args2);
        },
        execute: (...args2) => asyncReturn.refresh(...args2),
        clear: () => {
          const entry2 = nuxtApp._asyncData[key.value];
          if (entry2?._abortController) {
            try {
              entry2._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
            } finally {
              entry2._abortController = void 0;
            }
          }
          clearNuxtDataByKey(nuxtApp, key.value);
        }
      };
      const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
      Object.assign(asyncDataPromise, asyncReturn);
      Object.defineProperties(asyncDataPromise, {
        then: { enumerable: true, value: asyncDataPromise.then.bind(asyncDataPromise) },
        catch: { enumerable: true, value: asyncDataPromise.catch.bind(asyncDataPromise) },
        finally: { enumerable: true, value: asyncDataPromise.finally.bind(asyncDataPromise) }
      });
      return asyncDataPromise;
    }
    return useAsyncData2;
  }
});
const useAsyncData = createUseAsyncData.__nuxt_factory();
createUseAsyncData.__nuxt_factory({
  lazy: true,
  // @ts-expect-error private property
  _functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
  return computed({
    get() {
      return getter()?.value;
    },
    set(value) {
      const ref2 = getter();
      if (ref2) {
        ref2.value = value;
      }
    }
  });
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
  if (typeof keyOrFetcher === "string") {
    return false;
  }
  if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) {
    return false;
  }
  if (typeof keyOrFetcher === "function" && typeof fetcher === "function") {
    return false;
  }
  return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = void 0;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
    nuxtApp._asyncData[key].error.value = void 0;
    nuxtApp._asyncData[key].status.value = "idle";
    nuxtApp._asyncData[key]._initialCachedData = void 0;
  }
  if (key in nuxtApp._asyncDataPromises) {
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
  nuxtApp.payload._errors[key] ??= void 0;
  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
  const handler = _handler ;
  const _ref = options.deep ? ref : shallowRef;
  const hasCachedData = initialCachedData !== void 0;
  const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
    if (!keys || keys.includes(key)) {
      await asyncData.execute({ cause: "refresh:hook" });
    }
  });
  const asyncData = {
    data: _ref(hasCachedData ? initialCachedData : options.default()),
    pending: computed(() => asyncData.status.value === "pending"),
    error: toRef(nuxtApp.payload._errors, key),
    status: shallowRef("idle"),
    execute: (...args) => {
      const [_opts, newValue = void 0] = args;
      const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
      if (nuxtApp._asyncDataPromises[key]) {
        if ((opts.dedupe ?? options.dedupe) === "defer") {
          return nuxtApp._asyncDataPromises[key];
        }
      }
      {
        const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
        if (cachedData !== void 0) {
          nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
          asyncData.error.value = void 0;
          asyncData.status.value = "success";
          return Promise.resolve(cachedData);
        }
      }
      if (asyncData._abortController) {
        asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
      }
      asyncData._abortController = new AbortController();
      asyncData.status.value = "pending";
      const cleanupController = new AbortController();
      const promise = new Promise(
        (resolve, reject) => {
          try {
            const timeout = opts.timeout ?? options.timeout;
            const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
            if (mergedSignal.aborted) {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
              return;
            }
            mergedSignal.addEventListener("abort", () => {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
            }, { once: true, signal: cleanupController.signal });
            return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
          } catch (err) {
            reject(err);
          }
        }
      ).then(async (_result) => {
        if (nuxtApp._asyncDataPromises[key] !== promise) {
          return;
        }
        let result = _result;
        if (options.transform) {
          result = await options.transform(_result);
        }
        if (options.pick) {
          result = pick(result, options.pick);
        }
        nuxtApp.payload.data[key] = result;
        asyncData.data.value = result;
        asyncData.error.value = void 0;
        asyncData.status.value = "success";
      }).catch((error) => {
        if (nuxtApp._asyncDataPromises[key] !== promise) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (asyncData._abortController?.signal.aborted) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
          asyncData.status.value = "idle";
          return nuxtApp._asyncDataPromises[key];
        }
        asyncData.error.value = createError(error);
        asyncData.data.value = unref(options.default());
        asyncData.status.value = "error";
      }).finally(() => {
        cleanupController.abort();
        if (nuxtApp._asyncDataPromises[key] === promise) {
          delete nuxtApp._asyncDataPromises[key];
        }
      });
      nuxtApp._asyncDataPromises[key] = promise;
      return nuxtApp._asyncDataPromises[key];
    },
    _execute: debounce((...args) => asyncData.execute(...args), 0, { leading: true }),
    _default: options.default,
    _deps: 0,
    _init: true,
    _hash: void 0,
    _off: () => {
      unsubRefreshAsyncData();
      if (nuxtApp._asyncData[key]?._init) {
        nuxtApp._asyncData[key]._init = false;
      }
      if (!hasCustomGetCachedData) {
        nextTick(() => {
          if (!nuxtApp._asyncData[key]?._init) {
            clearNuxtDataByKey(nuxtApp, key);
            asyncData.execute = () => Promise.resolve();
          }
        });
      }
    }
  };
  return asyncData;
}
const getDefault = () => void 0;
const getDefaultCachedData = (key, nuxtApp, ctx) => {
  if (nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key];
  }
  if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") {
    return nuxtApp.static.data[key];
  }
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
  const list = signals.filter((s) => !!s);
  if (typeof timeout === "number" && timeout >= 0) {
    const timeoutSignal = AbortSignal.timeout?.(timeout);
    if (timeoutSignal) {
      list.push(timeoutSignal);
    }
  }
  if (AbortSignal.any) {
    return AbortSignal.any(list);
  }
  const controller = new AbortController();
  for (const sig of list) {
    if (sig.aborted) {
      const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
      try {
        controller.abort(reason);
      } catch {
        controller.abort();
      }
      return controller.signal;
    }
  }
  const onAbort = () => {
    const abortedSignal = list.find((s) => s.aborted);
    const reason = abortedSignal?.reason ?? new DOMException("Aborted", "AbortError");
    try {
      controller.abort(reason);
    } catch {
      controller.abort();
    }
  };
  for (const sig of list) {
    sig.addEventListener?.("abort", onAbort, { once: true, signal: cleanupSignal });
  }
  return controller.signal;
}
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (init) {
    nuxtApp._state[key] ??= { _default: init };
  }
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}
function generateOptionSegments(opts) {
  const segments = [
    toValue(opts.method)?.toUpperCase() || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.query || opts.params]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) {
      segments.push(hash(value));
    } else if (value instanceof ArrayBuffer) {
      segments.push(hash(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    } else if (value instanceof FormData) {
      const entries = [];
      for (const entry2 of value.entries()) {
        const [key, val] = entry2;
        entries.push([key, val instanceof File ? `${val.name}:${val.size}:${val.lastModified}` : val]);
      }
      segments.push(hash(entries));
    } else if (shared_cjs_prodExports.isPlainObject(value)) {
      segments.push(hash(reactive(value)));
    } else {
      try {
        segments.push(hash(value));
      } catch {
        console.warn("[useFetch] Failed to hash body", value);
      }
    }
  }
  return segments;
}
const createUseFetch = defineKeyedFunctionFactory({
  name: "createUseFetch",
  factory(options = {}) {
    function useFetch2(request, arg1, arg2) {
      const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
      const factoryOptions = typeof options === "function" ? options(opts) : options;
      const {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick: pick2,
        watch: watchSources,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        ...fetchOptions
      } = {
        ...typeof options === "function" ? {} : factoryOptions,
        ...opts,
        ...typeof options === "function" ? factoryOptions : {}
      };
      const _request = computed(() => toValue(request));
      const key = computed(() => toValue(fetchOptions.key) || "$f" + hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(fetchOptions)]));
      if (!fetchOptions.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
        throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
      }
      const _fetchOptions = reactive({
        ...fetchDefaults,
        ...fetchOptions,
        cache: typeof fetchOptions.cache === "boolean" ? void 0 : fetchOptions.cache
      });
      const _asyncDataOptions = {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick: pick2,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
      };
      if (watchSources === false) {
        _asyncDataOptions._keyTriggersExecute = false;
      }
      const asyncData = useAsyncData(key, (_, { signal }) => {
        let _$fetch = fetchOptions.$fetch || globalThis.$fetch;
        if (!fetchOptions.$fetch) {
          const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(fetchOptions.baseURL) || toValue(fetchOptions.baseURL)[0] === "/");
          if (isLocalFetch) {
            _$fetch = useRequestFetch();
          }
        }
        return _$fetch(_request.value, { signal, ..._fetchOptions });
      }, _asyncDataOptions);
      return asyncData;
    }
    return useFetch2;
  }
});
createUseFetch.__nuxt_factory();
createUseFetch.__nuxt_factory({
  lazy: true,
  // @ts-expect-error private property
  _functionName: "useLazyFetch"
});
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = pinia_prodExports.createPinia();
    nuxtApp.vueApp.use(pinia);
    pinia_prodExports.setActivePinia(pinia);
    if (nuxtApp.payload && nuxtApp.payload.pinia) {
      pinia.state.value = nuxtApp.payload.pinia;
    }
    return {
      provide: {
        pinia
      }
    };
  },
  hooks: {
    "app:rendered"() {
      const nuxtApp = useNuxtApp();
      nuxtApp.payload.pinia = toRaw(nuxtApp.$pinia).state.value;
      pinia_prodExports.setActivePinia(void 0);
    }
  }
});
const components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const pwa_icons_plugin_OtOZ6CGly_Vz5_PCGGLA9qHLz2Y5_d5czYAX7q_3Lug = /* @__PURE__ */ defineNuxtPlugin(() => {
  return {
    provide: {
      pwaIcons: {
        transparent: {},
        maskable: {},
        favicon: {},
        apple: {},
        appleSplashScreen: {}
      }
    }
  };
});
const preference = "system";
const plugin_server_8h7s0If21lrIdyJnjaRUzd_B4C24k7wcNk_9RPR9Cag = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  const colorMode = nuxtApp.ssrContext?.islandContext ? ref({}).value : useState("color-mode", () => reactive({
    preference,
    value: preference,
    unknown: true,
    forced: false
  })).value;
  const htmlAttrs = {};
  useHead({ htmlAttrs });
  useRouter().afterEach((to) => {
    const forcedColorMode = to.meta.colorMode;
    if (forcedColorMode && forcedColorMode !== "system") {
      htmlAttrs["data-color-mode-forced"] = forcedColorMode;
      colorMode.value = forcedColorMode;
      colorMode.forced = true;
    } else if (forcedColorMode === "system") {
      console.warn("You cannot force the colorMode to system at the page level.");
    }
  });
  nuxtApp.provide("colorMode", colorMode);
});
const plugins = [
  payloadPlugin,
  unhead_IWq_ShTzHMH4qtylEUccNKr8YvUuLLYneiEzQ81VSlM,
  router_vfVI2BKuynxAmlCPicRMU673SIE8l8VxlaS9HbspBC4,
  revive_payload_server_UihyQxYp0qCsq6rGIfnlBz_xJE_uKBgiz3hnzE0umhY,
  plugin,
  components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8,
  pwa_icons_plugin_OtOZ6CGly_Vz5_PCGGLA9qHLz2Y5_d5czYAX7q_3Lug,
  plugin_server_8h7s0If21lrIdyJnjaRUzd_B4C24k7wcNk_9RPR9Cag
];
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "TopAppBar",
  __ssrInlineRender: true,
  props: {
    title: {},
    colorMode: {}
  },
  emits: ["toggle-theme", "logo-click"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "bg-[linear-gradient(180deg, rgb(255 255 255 / 80%) 0%, rgb(240 240 240 / 40%) 60%)] dark:bg-[linear-gradient(180deg,rgba(26,18,40,0.45)_0%,rgba(10,10,15,0.85)_60%)] backdrop-blur-md text-primary border-outline-variant/20 flex justify-between items-start py-3 px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] w-full fixed top-0 z-50" }, _attrs))}><div class="flex-column"><div class="flex items-center gap-md mb-1"><h1 class="font-serif text-headline-lg text-primary">${ssrInterpolate(__props.title)}</h1></div><p class="text-xs text-black/30 dark:text-white/30">Convierte y compara programas de recompensas y fidelización en pesos chilenos.</p></div><div class="flex ml-4 items-center"><button class="flex align-center rounded-full active:scale-95 duration-100 cursor-pointer" aria-label="Cambiar tema"><span class="material-symbols-outlined text-lg" style="${ssrRenderStyle({ "font-variation-settings": "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" })}">${ssrInterpolate(__props.colorMode === "dark" ? "light_mode" : "dark_mode")}</span></button></div></header>`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/top-app-bar/TopAppBar.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "InputCard",
  __ssrInlineRender: true,
  props: {
    label: {},
    programOptions: {},
    selectedProgram: {},
    inputValue: {},
    inputPlaceholder: {},
    inputPrefix: {},
    programIcon: {},
    validationMsg: {},
    usdRate: {}
  },
  emits: [
    "update:inputValue",
    "update:selectedProgram",
    "open-keyboard"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const formattedValue = computed(() => {
      const val = String(props.inputValue).replace(/\D/g, "");
      if (!val) return "";
      return Number(val).toLocaleString("es-CL");
    });
    const isMobile = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-surface-container-lowest border border-outline-variant rounded-md p-lg shadow-lg" }, _attrs))} data-v-aea447b8><label class="font-label-md text-label-md text-on-surface-variant mb-sm block uppercase" data-v-aea447b8>${ssrInterpolate(__props.label)}</label><div class="flex flex-col md:flex-row gap-md" data-v-aea447b8><div class="relative flex-1" data-v-aea447b8><select class="w-full h-14 pl-12 pr-4 rounded-md border-2 border-outline-variant bg-surface focus:border-primary focus:ring-0 outline-none appearance-none font-medium text-headline-sm transition-all cursor-pointer font-[&#39;Geist_Mono&#39;,monospace]"${ssrRenderAttr("value", __props.selectedProgram)} data-v-aea447b8><!--[-->`);
      ssrRenderList(__props.programOptions, (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)} data-v-aea447b8>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (__props.programIcon) {
        _push(`<span class="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant" data-v-aea447b8>${ssrInterpolate(__props.programIcon)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="relative flex-1" data-v-aea447b8>`);
      if (__props.inputPrefix) {
        _push(`<span class="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold select-none z-10" data-v-aea447b8>${ssrInterpolate(__props.inputPrefix)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<input class="${ssrRenderClass([__props.inputPrefix === "DP$" ? "pl-14" : "pl-11", "w-full h-14 pl-14 pr-4 rounded-md border-2 border-outline-variant bg-surface focus:border-primary focus:ring-0 outline-none font-medium text-headline-sm transition-all font-['Geist_Mono',monospace]"])}"${ssrRenderAttr("placeholder", __props.inputPlaceholder)} type="text"${ssrRenderAttr("value", formattedValue.value)}${ssrIncludeBooleanAttr(isMobile.value) ? " readonly" : ""}${ssrRenderAttr("tabindex", isMobile.value ? 0 : 1)} inputmode="numeric" autocomplete="off" maxlength="8" data-v-aea447b8></div></div>`);
      if (__props.validationMsg) {
        _push(`<p class="mt-2 text-error text-label-sm" data-v-aea447b8>${ssrInterpolate(__props.validationMsg)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.usdRate) {
        _push(`<div class="mt-2 flex items-center justify-end gap-1.5 text-xs text-on-surface-variant" data-v-aea447b8><span class="material-symbols-outlined text-[14px]" data-v-aea447b8>currency_exchange</span><span data-v-aea447b8>USD/CLP <strong data-v-aea447b8>$${ssrInterpolate(__props.usdRate.toLocaleString("es-CL"))}</strong></span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/input-card/InputCard.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const InputCard = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-aea447b8"]]);
const CATEGORY_LABELS = {
  vuelos: "vuelos",
  retail: "retail",
  banco: "banco",
  cashback: "cashback",
  combustible: "combustible"
};
const programs = [
  {
    id: "clp",
    name: "Pesos Chilenos",
    icon: "payments",
    rate: 1,
    color: "#003dc7",
    unit: "$"
  },
  {
    id: "cencosud",
    name: "Puntos Cencosud",
    icon: "shopping_bag",
    rate: 1 / 300,
    // ← era 2, corregido: 1 pt por cada $1
    color: "#10b981",
    unit: "pts",
    category: "retail",
    catColor: "#10b981",
    sub: "Jumbo · Paris · Easy · Santa Isabel"
  },
  {
    id: "latam",
    name: "LATAM Pass",
    icon: "flight_takeoff",
    rate: 1 / (0.032 * 940),
    // ← era 0.1, fallback con TC 940 de referencia
    getRate: (usd) => 1 / (0.032 * usd),
    color: "#3b82f6",
    unit: "Mi",
    category: "vuelos",
    catColor: "#3b82f6",
    sub: "Millas aéreas · Santander LATAM"
  },
  {
    id: "lider",
    name: "Lider Mi Club",
    icon: "storefront",
    rate: 0.06,
    // 6% cashback = $0.06 por CLP
    color: "#22c55e",
    unit: "$",
    category: "cashback",
    catColor: "#22c55e",
    sub: "Walmart Chile · Tarjeta Lider Bci"
  },
  {
    id: "cmr",
    name: "CMR Puntos",
    icon: "credit_card",
    rate: 1 / 200,
    // ← era 0.142, corregido: 1 pt cada $150 = 0.00667
    color: "#f97316",
    unit: "pts",
    category: "retail",
    catColor: "#f97316",
    sub: "Falabella · Sodimac · Tottus"
  },
  {
    id: "bchile",
    name: "Dólares Premio",
    icon: "currency_exchange",
    rate: 1 / 903,
    // 1 DP ≈ $903 CLP (canje real en tienda Travel Club)
    color: "#ef4444",
    unit: "DP$",
    category: "banco",
    catColor: "#ef4444",
    sub: "Banco de Chile · Travel Club"
  },
  {
    id: "ripley",
    name: "Ripley Puntos",
    icon: "local_mall",
    rate: 1 / 125,
    // ← era 0.125, corregido: 1 pt cada $200 = 0.005
    color: "#8b5cf6",
    unit: "pts",
    category: "retail",
    catColor: "#8b5cf6",
    sub: "Tiendas Ripley · Banco Ripley"
  },
  {
    id: "sky",
    name: "SKY Plus",
    icon: "airplane_ticket",
    rate: 2.5 / 940,
    // ← era 0.05, fallback: 2.5 pts/USD ÷ TC 940 = 0.00266
    getRate: (usd) => 2.5 / usd,
    color: "#0099cc",
    unit: "pts",
    category: "vuelos",
    catColor: "#0099cc",
    sub: "SKY Airline"
  },
  {
    id: "itau",
    name: "Itaú Puntos",
    icon: "account_balance",
    rate: 1.5 / 350,
    // ← era 0.004, corregido: 1.5 pts cada $350 = 0.004286
    color: "#f59e0b",
    unit: "pts",
    category: "banco",
    catColor: "#f59e0b",
    sub: "Banco Itaú Chile"
  },
  {
    id: "bciplus",
    name: "BciPlus+",
    icon: "credit_score",
    rate: 0.01,
    // 1% cashback = $0.01 por CLP
    color: "#a855f7",
    unit: "$",
    category: "cashback",
    catColor: "#a855f7",
    sub: "Banco BCI · MACH cashback"
  },
  {
    id: "copec",
    name: "Full Copec",
    icon: "local_gas_station",
    rate: 0.01,
    // ✓ correcto: 1 pt cada $100
    color: "#f43f5e",
    unit: "pts",
    category: "combustible",
    catColor: "#f43f5e",
    sub: "Copec · Tiendas Pronto"
  }
];
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "SourcesModal",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    programs: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    function getRateDesc(p) {
      const descs = {
        clp: "Referencia CLP",
        cencosud: "1 pt cada $300",
        latam: "USD 0,032 por milla al TC",
        lider: "6% cashback",
        cmr: "1 pt cada $200",
        bchile: "1 DP ≈ $903 CLP",
        ripley: "1 pt cada $125",
        sky: "~USD 0,01/pto (ref. mercado)",
        itau: "1,5 pts cada $350",
        bciplus: "1% cashback",
        copec: "1 pt cada $100"
      };
      return descs[p.id] ?? "—";
    }
    function getSource(p) {
      const sources = {
        clp: "https://www.bcentral.cl/",
        cencosud: "https://puntoscencosud.cl",
        latam: "https://latampass.latam.com/es_cl",
        lider: "https://liderbci.cl/mi-club",
        cmr: "https://cmrpuntos.cl",
        bchile: "https://travel.cl",
        ripley: "https://home.ripley.cl/minisitios/ripleypuntos",
        sky: "https://skyairline.com/cl/sky-plus",
        itau: "https://itaubeneficios.cl",
        bciplus: "https://bci.cl/personas/tarjetas/bciplus",
        copec: "https://fullcopec.cl"
      };
      return sources[p.id] ?? "—";
    }
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.open) {
          _push2(`<div class="fixed inset-0 z-[9998] flex items-center justify-center p-4" data-v-c85a614b><div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-v-c85a614b></div><div class="relative w-[90%] max-h-[85vh] bg-surface rounded-md shadow-2xl overflow-hidden flex flex-col z-10 border border-primary" data-v-c85a614b><div class="flex items-center justify-between p-4 border-b border-primary" data-v-c85a614b><h3 class="font-headline-sm text-headline-xs md:text-headline-md md:font-light text-on-surface" data-v-c85a614b>Fuentes &amp; tasas de referencia</h3><button class="flex items-center p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer" aria-label="Cerrar" data-v-c85a614b><span class="material-symbols-outlined text-primary" data-v-c85a614b>close</span></button></div><div class="overflow-y-auto p-4 md:p-6" data-v-c85a614b><dl class="divide-y divide-on-surface-variant" data-v-c85a614b><!--[-->`);
          ssrRenderList(__props.programs, (p) => {
            _push2(`<div class="py-3 space-y-1" data-v-c85a614b><dt class="font-semibold text-foreground text-sm" data-v-c85a614b>${ssrInterpolate(p.name)}</dt><dd class="text-xs text-on-surface-variant grid grid-cols-[1fr_2fr] gap-x-2 gap-y-0.5" data-v-c85a614b><span class="text-outline" data-v-c85a614b>Acumulación:</span><span data-v-c85a614b>${ssrInterpolate(p.sub ?? "—")}</span><span class="text-outline" data-v-c85a614b>Canje / valor:</span><span data-v-c85a614b>${ssrInterpolate(getRateDesc(p))}</span><span class="text-outline" data-v-c85a614b>Fuente:</span><span data-v-c85a614b>`);
            if (getSource(p).startsWith("http")) {
              _push2(`<a${ssrRenderAttr("href", getSource(p))} target="_blank" rel="noopener noreferrer" class="text-primary underline hover:no-underline break-all" data-v-c85a614b>${ssrInterpolate(getSource(p))}</a>`);
            } else {
              _push2(`<span class="break-all" data-v-c85a614b>${ssrInterpolate(getSource(p))}</span>`);
            }
            _push2(`</span></dd></div>`);
          });
          _push2(`<!--]--></dl><div class="mt-6 text-xs text-on-surface-variant leading-relaxed p-4 border border-dashed border-primary rounded-lg" data-v-c85a614b> ⚠️ Los valores son referenciales y pueden cambiar sin aviso. SKY Plus no publica valor monetario oficial por punto; se usa ~USD 0,01/pto como referencia de mercado. BCI Puntos y Pesos OpenSky finalizaron en jul-2025; se muestra BciPlus+ (cashback 1%). Verifica siempre en los sitios oficiales de cada programa antes de tomar decisiones financieras. </div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/sources-modal/SourcesModal.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const SourcesModal = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-c85a614b"]]);
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "SiteFooter",
  __ssrInlineRender: true,
  props: {
    title: {}
  },
  setup(__props) {
    const showModal = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><footer class="w-full flex flex-col items-center gap-md px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] text-center py-xl mt-sm bg-surface-container-low border-t border-outline-variant"><p class="font-body-sm text-sm font-light text-stone-400 max-w-2xl"> Los valores son referenciales y pueden variar según promociones vigentes. Las conversiones se basan en canjes estándar de catálogo. <button class="text-primary underline hover:no-underline cursor-pointer">Ver detalle</button>. </p><p class="font-label-sm text-sm text-stone-400 font-light mt-sm">© 2026 ${ssrInterpolate(__props.title)}</p></footer>`);
      _push(ssrRenderComponent(SourcesModal, {
        open: showModal.value,
        programs: unref(programs),
        onClose: ($event) => showModal.value = false
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/site-footer/SiteFooter.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "ActionButton",
  __ssrInlineRender: true,
  props: {
    icon: {},
    color: {},
    textColor: {},
    type: {}
  },
  setup(__props) {
    const props = __props;
    const buttonType = computed(() => props.type ?? "button");
    const colorClass = computed(() => {
      if (props.color === "whatsapp") return "bg-[#25D366]";
      if (props.color === "primary") return "bg-primary";
      if (props.color && props.color.startsWith("bg-")) return props.color;
      if (props.color && props.color.startsWith("#")) return "";
      return "bg-primary";
    });
    const textClass = computed(() => {
      if (props.color === "whatsapp") return "text-white";
      if (props.color === "primary") return "text-on-primary";
      if (props.textColor) return props.textColor;
      return "text-on-primary";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        class: [
          "flex items-center justify-center gap-sm py-4 px-lg rounded-md font-bold font-headline-sm hover:brightness-90 transition-all active:scale-95 shadow-sm cursor-pointer",
          colorClass.value,
          textClass.value
        ],
        type: buttonType.value
      }, _attrs))}>`);
      if (__props.icon) {
        _push(`<span class="material-symbols-outlined">${ssrInterpolate(__props.icon)}</span>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</button>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/action-button/ActionButton.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "WhatsAppShare",
  __ssrInlineRender: true,
  props: {
    visible: { type: Boolean },
    baseName: {},
    baseLabel: {},
    cards: {},
    siteUrl: {}
  },
  setup(__props) {
    const props = __props;
    function share() {
      const url = props.siteUrl || "https://mispuntos.cl";
      let text = `*Convertí ${props.baseLabel} ${props.baseName}* a:

`;
      for (const card of props.cards) {
        const value = formatCardValue(card.points, card.unit);
        text += `• ${card.programName}: *${value}*
`;
      }
      text += `
Convierte tus puntos y millas en ${url}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      (void 0).open(whatsappUrl, "_blank");
    }
    function formatCardValue(points, unit) {
      if (unit === "$" || unit === "DP$") return `${unit} ${points}`;
      return `${points} ${unit}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "sticky bottom-0 pb-4 pt-2 flex justify-end" }, _attrs))}>`);
      if (__props.visible) {
        _push(ssrRenderComponent(_sfc_main$6, {
          icon: "share",
          color: "whatsapp",
          class: "w-full md:w-auto",
          onClick: share
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Compartir en WhatsApp`);
            } else {
              return [
                createTextVNode("Compartir en WhatsApp")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/whatsapp-share/WhatsAppShare.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "VirtualKeyboard",
  __ssrInlineRender: true,
  props: {
    visible: { type: Boolean }
  },
  emits: ["key", "backspace", "clear", "done"],
  setup(__props, { emit: __emit }) {
    const keys = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "clear",
      "0",
      "backspace"
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="fixed inset-0 z-[59] md:hidden" style="${ssrRenderStyle(__props.visible ? null : { display: "none" })}" data-v-0e8d78e9></div><div class="${ssrRenderClass([__props.visible ? "translate-y-0" : "translate-y-full", "fixed bottom-[-1px] left-0 w-full bg-surface-container-highest border-t border-outline-variant transition-transform duration-300 z-[60] md:hidden"])}" style="${ssrRenderStyle([
        { "will-change": "transform" },
        null
      ])}" data-v-0e8d78e9><div class="p-4 grid grid-cols-3 gap-2" data-v-0e8d78e9><!--[-->`);
      ssrRenderList(keys, (key) => {
        _push(`<button class="keyboard-key bg-surface h-14 rounded-md font-bold text-xl flex items-center justify-center" data-v-0e8d78e9>`);
        if (key !== "backspace" && key !== "clear") {
          _push(`<span data-v-0e8d78e9>${ssrInterpolate(key)}</span>`);
        } else if (key === "backspace") {
          _push(`<span class="material-symbols-outlined" data-v-0e8d78e9>backspace</span>`);
        } else if (key === "clear") {
          _push(`<span data-v-0e8d78e9>C</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div><div class="bg-surface-container-high flex justify-center" data-v-0e8d78e9><button class="bg-primary text-white font-bold px-8 py-4 w-full flex items-center justify-center gap-1 uppercase" data-v-0e8d78e9> Cerrar <span class="material-symbols-outlined" data-v-0e8d78e9>keyboard_arrow_down</span></button></div></div><!--]-->`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/virtual-keyboard/VirtualKeyboard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const VirtualKeyboard = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-0e8d78e9"]]);
function useColorMode() {
  const colorMode = ref("light");
  const hasManualOverride = ref(false);
  function setColorMode(mode) {
    colorMode.value = mode;
    (void 0).documentElement.classList.toggle("dark", mode === "dark");
  }
  function applyAutoColorMode(mode) {
    if (!hasManualOverride.value) setColorMode(mode);
  }
  function toggleColorMode() {
    const next = colorMode.value === "dark" ? "light" : "dark";
    hasManualOverride.value = true;
    localStorage.setItem("color-mode", next);
    setColorMode(next);
  }
  function initColorMode() {
    const prefersDark = (void 0).matchMedia("(prefers-color-scheme: dark)");
    const saved = localStorage.getItem("color-mode");
    if (saved === "dark" || saved === "light") {
      hasManualOverride.value = true;
      setColorMode(saved);
    } else {
      setColorMode(prefersDark.matches ? "dark" : "light");
    }
    prefersDark.addEventListener("change", (e) => {
      applyAutoColorMode(e.matches ? "dark" : "light");
    });
  }
  return {
    colorMode,
    hasManualOverride,
    setColorMode,
    applyAutoColorMode,
    toggleColorMode,
    initColorMode
  };
}
function useDragReorder(resultCards) {
  const hasReordered = ref(false);
  const cardOrder = ref(loadCardOrder());
  const draggedName = ref(null);
  const isDragging = ref(false);
  const dropIndex = ref(-1);
  function loadCardOrder() {
    return [];
  }
  function saveCardOrder() {
    return;
  }
  function persistReordered() {
    hasReordered.value = true;
  }
  watch(resultCards, (cards) => {
    const currentNames = new Set(cards.map((c) => c.programName));
    cardOrder.value = cardOrder.value.filter((n) => currentNames.has(n));
    for (const name of cards.map((c) => c.programName)) {
      if (!cardOrder.value.includes(name)) cardOrder.value.push(name);
    }
  }, { immediate: true });
  function resetDragState() {
    draggedName.value = null;
    isDragging.value = false;
    dropIndex.value = -1;
    (void 0).querySelectorAll(".program-card").forEach((el) => {
      const card = el;
      card.classList.remove("opacity-30");
      if (!card.classList.contains("bg-surface-container-lowest")) {
        card.classList.add("bg-surface-container-lowest");
      }
    });
  }
  function onDragStart(name, e) {
    draggedName.value = name;
    isDragging.value = true;
    dropIndex.value = -1;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", name);
    }
    const el = e.currentTarget;
    requestAnimationFrame(() => el.classList.add("opacity-30"));
  }
  function onDragOver(e) {
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    if (!draggedName.value) return;
    const cards = (void 0).querySelectorAll(".program-card");
    let closestGap = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      [rect.top, rect.bottom].forEach((y, j) => {
        const dist = Math.abs(e.clientY - y);
        if (dist < closestDist) {
          closestDist = dist;
          closestGap = i + j;
        }
      });
    });
    dropIndex.value = closestGap;
  }
  function onDrop(_e) {
    if (!draggedName.value || dropIndex.value < 0) {
      resetDragState();
      return;
    }
    const newOrder = cardOrder.value.filter((n) => n !== draggedName.value);
    newOrder.splice(dropIndex.value, 0, draggedName.value);
    cardOrder.value = newOrder;
    persistReordered();
    resetDragState();
  }
  function onDragEnd() {
    resetDragState();
  }
  function onDragLeaveContainer(e) {
    const container = e.currentTarget;
    const related = e.relatedTarget;
    if (related && container.contains(related)) return;
    dropIndex.value = -1;
  }
  function onTouchStart(name, e) {
    const target = e.target;
    if (!target.closest(".drag-handle")) return;
    e.preventDefault();
    draggedName.value = name;
    isDragging.value = true;
    dropIndex.value = -1;
    e.touches[0].clientY;
    const el = e.currentTarget;
    requestAnimationFrame(() => {
      el.classList.remove("bg-surface-container-lowest");
      el.classList.add("opacity-30");
    });
  }
  function onTouchMove(e) {
    if (!draggedName.value) return;
    const y = e.touches[0].clientY;
    const cards = (void 0).querySelectorAll(".program-card");
    let closestGap = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      [rect.top, rect.bottom].forEach((yEdge, j) => {
        const dist = Math.abs(y - yEdge);
        if (dist < closestDist) {
          closestDist = dist;
          closestGap = i + j;
        }
      });
    });
    dropIndex.value = closestGap;
  }
  function onTouchEnd() {
    if (!draggedName.value) {
      resetDragState();
      return;
    }
    if (dropIndex.value >= 0) {
      const newOrder = cardOrder.value.filter((n) => n !== draggedName.value);
      newOrder.splice(dropIndex.value, 0, draggedName.value);
      cardOrder.value = newOrder;
      persistReordered();
    }
    resetDragState();
  }
  return {
    hasReordered,
    cardOrder,
    isDragging,
    dropIndex,
    saveCardOrder,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDragLeaveContainer,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}
const useUsdRateStore = pinia_prodExports.defineStore("usdRate", () => {
  const rate = ref(940);
  const lastUpdated = ref(null);
  const loading = ref(false);
  const error = ref(null);
  async function fetchRate() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch("https://cl.dolarapi.com/v1/cotizaciones/usd");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      rate.value = Math.round(data.ultimoCierre ?? data.venta ?? data.compra ?? 940);
      lastUpdated.value = data.fechaActualizacion ?? (/* @__PURE__ */ new Date()).toISOString();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error al obtener USD";
    } finally {
      loading.value = false;
    }
  }
  return {
    rate,
    lastUpdated,
    loading,
    error,
    fetchRate
  };
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "Preloader",
  __ssrInlineRender: true,
  props: {
    ready: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    ref(null);
    watch(() => props.ready, (ready) => {
      if (ready) {
        (void 0).body.style.overflow = "";
        setTimeout(() => {
        }, 600);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="${ssrRenderClass([__props.ready ? "opacity-0 pointer-events-none" : "opacity-100", "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-in-out"])}"><div class="w-[350px] h-[250px]"></div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../components/ui/preloader/Preloader.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const { public: { appName, siteUrl } } = /* @__PURE__ */ useRuntimeConfig();
    const isMobile = ref(false);
    const keyboardVisible = ref(false);
    const validationMsg = ref("");
    const checkedCards = ref(/* @__PURE__ */ new Set());
    const preloaderReady = ref(false);
    new Promise((resolve) => setTimeout(resolve, 2e3));
    const {
      colorMode,
      toggleColorMode
    } = useColorMode();
    const programOptions = programs.map((p) => ({ value: p.id, label: `${p.name}` }));
    const selectedProgram = ref("clp");
    const inputValue = ref("10000");
    const usdRateStore = useUsdRateStore();
    const { rate: usdRate } = pinia_prodExports.storeToRefs(usdRateStore);
    const { fetchRate } = usdRateStore;
    const inputPrefix = computed(() => {
      if (selectedProgram.value === "clp") return "$";
      if (selectedProgram.value === "bchile") return "DP$";
      if (selectedProgram.value === "latam") return "Mi";
      if (selectedProgram.value === "lider" || selectedProgram.value === "bciplus") return "$";
      return "P✺";
    });
    const inputPlaceholder = computed(() => {
      if (selectedProgram.value === "clp" || selectedProgram.value === "bchile" || selectedProgram.value === "bciplus" || selectedProgram.value === "lider") return "Monto";
      if (selectedProgram.value === "latam") return "Millas";
      return "Puntos";
    });
    const resultCards = computed(() => {
      const base = programs.find((p) => p.id === selectedProgram.value);
      const baseValue = parseFloat(inputValue.value) || 0;
      if (!base) return [];
      const effRate = (p) => p.getRate ? p.getRate(usdRate.value) : p.rate;
      const clpValue = baseValue / effRate(base);
      return programs.filter((p) => p.id !== base.id).map((p) => {
        const converted = clpValue * effRate(p);
        const points = Math.round(converted).toLocaleString("es-CL");
        return {
          programName: p.name,
          programIcon: p.icon,
          programColor: p.color,
          points,
          unit: p.unit,
          chipLabel: p.category ? CATEGORY_LABELS[p.category] : void 0,
          chipColor: p.catColor ? `${p.catColor}22` : void 0,
          chipTextColor: p.catColor
        };
      });
    });
    const {
      hasReordered,
      cardOrder
    } = useDragReorder(resultCards);
    const sortedResultCards = computed(() => {
      const cards = [...resultCards.value];
      if (!hasReordered.value && selectedProgram.value !== "clp") {
        const clpIdx = cards.findIndex((c) => c.programName === "Pesos Chilenos");
        if (clpIdx > 0) {
          const [clpCard] = cards.splice(clpIdx, 1);
          if (clpCard) cards.unshift(clpCard);
        }
        return cards;
      }
      const orderMap = new Map(cardOrder.value.map((name, i) => [name, i]));
      return cards.sort((a, b) => {
        const ia = orderMap.get(a.programName) ?? Infinity;
        const ib = orderMap.get(b.programName) ?? Infinity;
        return ia - ib;
      });
    });
    const selectedProgramName = computed(() => {
      return programs.find((p) => p.id === selectedProgram.value)?.name ?? "";
    });
    const selectedProgramLabel = computed(() => {
      const raw = inputValue.value.replace(/\D/g, "") || "0";
      const formatted = Number(raw).toLocaleString("es-CL");
      const prefix = inputPrefix.value;
      if (prefix === "$" || prefix === "DP$") return `${prefix}${formatted}`;
      return `${formatted} ${prefix}`;
    });
    const checkedCardsData = computed(() => {
      const names = checkedCards.value;
      return sortedResultCards.value.filter((c) => names.has(c.programName)).map((c) => ({ programName: c.programName, points: c.points, unit: c.unit }));
    });
    function onKeyboardKey(key) {
      if (!/^\d$/.test(key)) return;
      const rawDigits = inputValue.value.replace(/\D/g, "");
      if (rawDigits.length >= 8) return;
      inputValue.value = (rawDigits + key).replace(/^0+/, "");
    }
    function onKeyboardBackspace() {
      inputValue.value = inputValue.value.slice(0, -1);
    }
    function onKeyboardClear() {
      inputValue.value = "";
    }
    function onKeyboardDone() {
      keyboardVisible.value = false;
    }
    watch(selectedProgram, () => {
      inputValue.value = "";
      if (isMobile.value && !keyboardVisible.value) keyboardVisible.value = true;
    });
    watch(keyboardVisible, (visible) => {
      if (!isMobile.value) return;
      if (visible) {
        (void 0).scrollTo({ top: 0, behavior: "smooth" });
        (void 0).documentElement.style.overflow = "hidden";
      } else {
        (void 0).documentElement.style.overflow = "";
      }
    });
    watch(inputValue, (val) => {
      const raw = String(val).replace(/\D/g, "");
      if (!raw || raw === "0") {
        checkedCards.value = /* @__PURE__ */ new Set();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$a, {
        title: unref(appName),
        colorMode: unref(colorMode),
        onToggleTheme: unref(toggleColorMode),
        onLogoClick: () => {
        }
      }, null, _parent));
      _push(`<div class="flex-grow pt-32 pb-4 px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] max-w-4xl mx-auto w-full" id="main-content"><section class="mb-xl">`);
      _push(ssrRenderComponent(InputCard, {
        label: "Conversión Base",
        programOptions: unref(programOptions),
        selectedProgram: selectedProgram.value,
        inputValue: inputValue.value,
        inputPlaceholder: inputPlaceholder.value,
        inputPrefix: inputPrefix.value,
        programIcon: unref(programs).find((p) => p.id === selectedProgram.value)?.icon,
        validationMsg: validationMsg.value,
        usdRate: unref(usdRate),
        "onUpdate:selectedProgram": (val) => selectedProgram.value = val,
        "onUpdate:inputValue": (val) => inputValue.value = val,
        onOpenKeyboard: ($event) => keyboardVisible.value = true
      }, null, _parent));
      _push(`</section>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(ssrRenderComponent(unref(_sfc_main$5), {
        visible: checkedCards.value.size > 0,
        baseName: selectedProgramName.value,
        baseLabel: selectedProgramLabel.value,
        cards: checkedCardsData.value,
        siteUrl: unref(siteUrl)
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(unref(VirtualKeyboard), {
        visible: keyboardVisible.value,
        onKey: onKeyboardKey,
        onBackspace: onKeyboardBackspace,
        onClear: onKeyboardClear,
        onDone: onKeyboardDone
      }, null, _parent));
      _push(ssrRenderComponent(unref(_sfc_main$7), { title: unref(appName) }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$3, { ready: preloaderReady.value }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-BNoFhpRx.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-TjyCzd1r.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_bea980bdef312d10ccfb270dd5b2f6e6/node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info)?.catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_bea980bdef312d10ccfb270dd5b2f6e6/node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { _export_sfc as _, nuxtLinkDefaults as a, useNuxtApp as b, useRouter as c, useRuntimeConfig as d, entry_default as default, encodeRoutePath as e, navigateTo as n, resolveRouteObject as r, useHead as u };
//# sourceMappingURL=server.mjs.map
