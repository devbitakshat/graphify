module.exports = [
(()=>{"use strict";return[
"[project]/graphily/app/apple-icon.png.mjs { IMAGE => \"[project]/graphily/app/apple-icon.png (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$apple$2d$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/graphily/app/apple-icon.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$apple$2d$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 1024,
    height: 1024
};
}),
"[project]/graphily/app/favicon.ico.mjs { IMAGE => \"[project]/graphily/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/graphily/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 48,
    height: 48
};
}),
"[project]/graphily/app/icon.png.mjs { IMAGE => \"[project]/graphily/app/icon.png (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/graphily/app/icon.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 1024,
    height: 1024
};
}),
"[project]/graphily/app/login/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__debugCreateInstantConfigStack",
    ()=>__debugCreateInstantConfigStack,
    "default",
    ()=>Page,
    "instant",
    ()=>instant,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$auth$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/components/auth-form.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/auth/current-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$safe$2d$next$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/auth/safe-next.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const metadata = {
    title: "Sign in"
};
const instant = false;
async function Page({ searchParams }) {
    const params = await searchParams;
    const nextPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$safe$2d$next$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safeNext"])(params.next);
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOptionalUser"])();
    if (user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(nextPath);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "mx-auto grid w-full max-w-md flex-1 content-center px-6 py-16",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-[var(--line)] bg-[var(--card)] p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-semibold",
                    children: "Sign in"
                }, void 0, false, {
                    fileName: "[project]/graphily/app/login/page.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                params.error === "confirm" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-3 text-sm text-[var(--danger)]",
                    children: "Email confirmation failed. Request a new link or sign in if you already confirmed."
                }, void 0, false, {
                    fileName: "[project]/graphily/app/login/page.tsx",
                    lineNumber: 23,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$auth$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthForm"], {
                        mode: "login",
                        nextPath: nextPath
                    }, void 0, false, {
                        fileName: "[project]/graphily/app/login/page.tsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/graphily/app/login/page.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/graphily/app/login/page.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/graphily/app/login/page.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
const __debugCreateInstantConfigStack = process.env.NODE_ENV !== 'production' ? function instant() {
    const error = new Error(' ');
    error.name = 'Instant Validation';
    return error;
} : null;
}),
"[project]/graphily/components/auth-form.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthForm",
    ()=>AuthForm
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AuthForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AuthForm() from the server but AuthForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/graphily/components/auth-form.tsx", "AuthForm");
}),
"[project]/graphily/components/auth-form.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$auth$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/graphily/components/auth-form.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$auth$2d$form$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/graphily/lib/auth/current-user.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOptionalUser",
    ()=>getOptionalUser,
    "requireUser",
    ()=>requireUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/data/repository.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/auth-cache.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/env.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$session$2d$cookie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/supabase/session-cookie.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
const profiles = new Map();
function cachedProfile(id) {
    const hit = profiles.get(id);
    if (!hit || hit.until <= Date.now()) {
        if (hit) profiles.delete(id);
        return null;
    }
    return hit.user;
}
function rememberProfile(user) {
    profiles.set(user.id, {
        user,
        until: Date.now() + 5 * 60_000
    });
}
async function presentedToken() {
    const jar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const { url } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireSupabaseEnv"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$session$2d$cookie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["accessTokenFromCookies"])(jar.getAll(), url);
}
async function profileFor(identity) {
    const cached = cachedProfile(identity.id);
    if (cached) return cached;
    const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findUserById"])(identity.id);
    const profile = existing ? {
        id: existing.id,
        name: existing.name,
        email: existing.email
    } : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["upsertProfile"])(identity);
    const user = {
        id: profile.id,
        name: profile.name,
        email: profile.email
    };
    rememberProfile(user);
    return user;
}
function bubblePrerender(error) {
    if (typeof error !== "object" || error === null || !("digest" in error)) return;
    const digest = error.digest;
    if (digest === "HANGING_PROMISE_REJECTION" || typeof digest === "string" && digest.startsWith("NEXT_")) {
        throw error;
    }
}
async function userFromIdentity(identity) {
    try {
        return await profileFor(identity);
    } catch (error) {
        bubblePrerender(error);
        return {
            id: identity.id,
            name: identity.name,
            email: identity.email
        };
    }
}
const getOptionalUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async ()=>{
    // Supabase JWT validation uses Date.now(); defer until a real request.
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["connection"])();
    try {
        const presented = await presentedToken();
        if (presented && presented.expiresAtMs - Date.now() > 60_000) {
            const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cachedAuthUser"])(presented.token);
            if (known) return userFromIdentity(known);
        }
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSupabaseServerClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        const identity = user ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["identityOf"])(user) : null;
        if (!identity) return null;
        const fresh = await presentedToken();
        if (fresh) (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$supabase$2f$auth$2d$cache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rememberAuthUser"])(fresh.token, identity, fresh.expiresAtMs);
        return userFromIdentity(identity);
    } catch (error) {
        bubblePrerender(error);
        return null;
    }
});
async function requireUser() {
    const user = await getOptionalUser();
    if (!user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    return user;
}
}),
"[project]/graphily/lib/supabase/session-cookie.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
]})(),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/graphily/app/apple-icon.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/apple-icon.15hdq7sj067d4.png" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/graphily/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.117ezoe8m31dk.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/graphily/app/icon.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/icon.15hdq7sj067d4.png" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/graphily/app/login/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/graphily/app/login/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1lsc6rb5ropd1._.js.map