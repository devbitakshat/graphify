module.exports = [
(()=>{"use strict";return[
"[project]/graphily/lib/supabase/auth-cache.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cachedAuthUser",
    ()=>cachedAuthUser,
    "identityOf",
    ()=>identityOf,
    "rememberAuthUser",
    ()=>rememberAuthUser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const verified = new Map();
function tokenKey(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(token).digest("base64url");
}
function identityOf(user) {
    const email = user.email?.toLowerCase();
    if (!email) return null;
    const metaName = user.user_metadata?.name;
    const name = typeof metaName === "string" && metaName.trim() || email.split("@")[0] || "Learner";
    return {
        id: user.id,
        email,
        name
    };
}
function cachedAuthUser(token) {
    const hit = verified.get(tokenKey(token));
    if (!hit || hit.expiresAtMs <= Date.now()) {
        if (hit) verified.delete(tokenKey(token));
        return null;
    }
    return hit.user;
}
function rememberAuthUser(token, user, tokenExpiresAtMs) {
    if (tokenExpiresAtMs < Date.now() + 60_000) return;
    verified.set(tokenKey(token), {
        user,
        expiresAtMs: Date.now() + 60_000
    });
    if (verified.size > 20) {
        const oldest = verified.keys().next().value;
        if (oldest) verified.delete(oldest);
    }
}
}),
"[project]/graphily/lib/supabase/auth-fetch.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authFetch",
    ()=>authFetch
]);
const RETRY_DELAY_MS = 150;
function describe(error) {
    if (!(error instanceof Error)) return String(error);
    const cause = error.cause;
    return [
        error.message,
        cause?.code,
        cause?.message
    ].filter(Boolean).join(" · ");
}
async function authFetch(input, init) {
    const { signal: _signal, ...rest } = init ?? {};
    const nextInit = {
        ...rest,
        next: {
            internal: true
        }
    };
    try {
        return await globalThis.fetch(input, nextInit);
    } catch (error) {
        console.warn(`Auth request failed, retrying once: ${describe(error)}`);
        await new Promise((resolve)=>setTimeout(resolve, RETRY_DELAY_MS));
        try {
            return await globalThis.fetch(input, nextInit);
        } catch (retryError) {
            console.error(`Auth request failed again: ${describe(retryError)}`);
            throw retryError;
        }
    }
}
}),
"[project]/graphily/lib/supabase/env.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireSupabaseEnv",
    ()=>requireSupabaseEnv
]);
function requireSupabaseEnv() {
    const url = ("TURBOPACK compile-time value", "https://ypyppoepqjqdcmvxqout.supabase.co")?.trim();
    const anonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweXBwb2VwcWpxZGNtdnhxb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NjMxNTYsImV4cCI6MjEwODQzOTE1Nn0.t4mBrjYiM1pOkarr5uDFE-M6118eT1IIm3DB-5hGKBQ")?.trim();
    if (!url || !anonKey) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local (and Netlify env).");
    }
    return {
        url,
        anonKey
    };
}
}),
"[project]/graphily/lib/supabase/middleware.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/auth-cache.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$fetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/auth-fetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$env$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/env.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$session$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/session-cookie.ts [middleware] (ecmascript)");
;
;
;
;
;
;
async function updateSession(request) {
    const { url, anonKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$env$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["requireSupabaseEnv"])();
    const presented = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$session$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["accessTokenFromCookies"])(request.cookies.getAll(), url);
    if (presented && presented.expiresAtMs - Date.now() > 60_000) {
        const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cachedAuthUser"])(presented.token);
        if (known) return {
            response: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
                request
            }),
            user: known
        };
    }
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["createServerClient"])(url, anonKey, {
        global: {
            fetch: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$fetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["authFetch"]
        },
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet, headers) {
                for (const { name, value } of cookiesToSet){
                    request.cookies.set(name, value);
                }
                response = __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                for (const { name, value, options } of cookiesToSet){
                    response.cookies.set(name, value, options);
                }
                if (headers) {
                    Object.entries(headers).forEach(([key, value])=>{
                        response.headers.set(key, value);
                    });
                }
            }
        }
    });
    const { data: { user } } = await supabase.auth.getUser();
    const identity = user ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["identityOf"])(user) : null;
    const fresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$session$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["accessTokenFromCookies"])(request.cookies.getAll(), url);
    if (identity && fresh) (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["rememberAuthUser"])(fresh.token, identity, fresh.expiresAtMs);
    return {
        response,
        user: identity
    };
}
}),
"[project]/graphily/lib/supabase/session-cookie.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "accessTokenFromCookies",
    ()=>accessTokenFromCookies,
    "authCookieName",
    ()=>authCookieName
]);
const BASE64_PREFIX = "base64-";
function authCookieName(supabaseUrl) {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    return `sb-${projectRef}-auth-token`;
}
function combine(cookies, key) {
    const direct = cookies.find((cookie)=>cookie.name === key)?.value;
    if (direct) return direct;
    const parts = [];
    for(let index = 0;; index += 1){
        const part = cookies.find((cookie)=>cookie.name === `${key}.${index}`)?.value;
        if (!part) break;
        parts.push(part);
    }
    return parts.length > 0 ? parts.join("") : null;
}
function decode(value) {
    if (!value.startsWith(BASE64_PREFIX)) return value;
    return Buffer.from(value.slice(BASE64_PREFIX.length), "base64url").toString("utf8");
}
function accessTokenFromCookies(cookies, supabaseUrl) {
    try {
        const joined = combine(cookies, authCookieName(supabaseUrl));
        if (!joined) return null;
        const parsed = JSON.parse(decode(joined));
        if (typeof parsed.access_token !== "string" || parsed.access_token.length === 0) return null;
        const expiresAtMs = typeof parsed.expires_at === "number" ? parsed.expires_at * 1000 : 0;
        return {
            token: parsed.access_token,
            expiresAtMs
        };
    } catch  {
        return null;
    }
}
}),
"[project]/graphily/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/middleware.ts [middleware] (ecmascript)");
;
;
function loginRedirect(request) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
}
async function proxy(request) {
    // A server action must get a React action payload back. Sending the login
    // HTML page instead makes the browser throw "An unexpected response was
    // received from the server" and leaves the sign-in form unusable.
    const isServerAction = request.headers.has("next-action");
    try {
        const { response, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["updateSession"])(request);
        if (!user && !isServerAction) return loginRedirect(request);
        return response;
    } catch  {
        if (isServerAction) return __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
        return loginRedirect(request);
    }
}
const config = {
    matcher: [
        "/dashboard/:path*",
        "/spaces/:path*",
        "/settings/:path*"
    ]
};
}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/build/adapter/setup-node-env.external.js [external] (next/dist/build/adapter/setup-node-env.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/build/adapter/setup-node-env.external.js", () => require("next/dist/build/adapter/setup-node-env.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/memory-cache.external.js [external] (next/dist/server/lib/incremental-cache/memory-cache.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/memory-cache.external.js", () => require("next/dist/server/lib/incremental-cache/memory-cache.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/shared-cache-controls.external.js [external] (next/dist/server/lib/incremental-cache/shared-cache-controls.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js", () => require("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/router-utils/instrumentation-globals.external.js [external] (next/dist/server/lib/router-utils/instrumentation-globals.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/router-utils/instrumentation-globals.external.js", () => require("next/dist/server/lib/router-utils/instrumentation-globals.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xur248qnwe0k._.js.map