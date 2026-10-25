(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/graphily/app/actions/data:ecd3ea [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "saveAiSettingsAction",
    ()=>$$RSC_SERVER_ACTION_0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"600a9aa06464c63b9326c9253c314b618fc55e30e9":{"name":"saveAiSettingsAction"}},"graphily/app/actions/ai-settings.ts",""] */ "use turbopack: no side effects";
;
const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("600a9aa06464c63b9326c9253c314b618fc55e30e9", __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "saveAiSettingsAction");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/graphily/components/ai-settings-form.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AiSettingsForm",
    ()=>AiSettingsForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$data$3a$ecd3ea__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/graphily/app/actions/data:ecd3ea [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/components/ui.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/ai/providers.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AiSettingsForm({ current, nextPath }) {
    _s();
    const [state, action] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionState"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$data$3a$ecd3ea__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["saveAiSettingsAction"], null);
    const [provider, setProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(current?.provider ?? "openai");
    const [model, setModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(current?.model ?? __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aiProviders"].openai.models[0]);
    const info = __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aiProviders"][provider];
    const keepsKey = current?.provider === provider;
    function chooseProvider(value) {
        setProvider(value);
        setModel(value === current?.provider ? current.model : __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aiProviders"][value].models[0]);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        action: action,
        className: "grid gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "hidden",
                name: "next",
                value: nextPath
            }, void 0, false, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                label: "Provider",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectInput"], {
                    name: "provider",
                    value: provider,
                    onChange: (event)=>chooseProvider(event.target.value),
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aiProviderIds"].map((id)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: id,
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aiProviders"][id].label
                        }, id, false, {
                            fileName: "[project]/graphily/components/ai-settings-form.tsx",
                            lineNumber: 27,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/graphily/components/ai-settings-form.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                label: "Preferred model",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextInput"], {
                        name: "model",
                        list: "ai-model-suggestions",
                        value: model,
                        onChange: (event)=>setModel(event.target.value),
                        required: true,
                        maxLength: 120,
                        autoComplete: "off",
                        spellCheck: false
                    }, void 0, false, {
                        fileName: "[project]/graphily/components/ai-settings-form.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("datalist", {
                        id: "ai-model-suggestions",
                        children: info.models.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: name
                            }, name, false, {
                                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/graphily/components/ai-settings-form.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                label: "API key",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextInput"], {
                    name: "apiKey",
                    type: "password",
                    placeholder: keepsKey ? `Saved key ${current?.keyHint}. Leave blank to keep it.` : "Paste your API key",
                    required: !keepsKey,
                    maxLength: 400,
                    autoComplete: "off",
                    spellCheck: false
                }, void 0, false, {
                    fileName: "[project]/graphily/components/ai-settings-form.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-[var(--muted)]",
                children: [
                    "Get a key from",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: info.keyUrl,
                        target: "_blank",
                        rel: "noreferrer",
                        className: "text-[var(--accent)]",
                        children: info.label
                    }, void 0, false, {
                        fileName: "[project]/graphily/components/ai-settings-form.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    ". The key is encrypted before it is stored and is only used for your own graphs and definitions."
                ]
            }, void 0, true, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            state?.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-[var(--danger)]",
                children: state.error
            }, void 0, false, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 68,
                columnNumber: 23
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubmitButton"], {
                pendingLabel: "Checking key…",
                children: current ? "Save settings" : "Save and continue"
            }, void 0, false, {
                fileName: "[project]/graphily/components/ai-settings-form.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/graphily/components/ai-settings-form.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_s(AiSettingsForm, "d4bgvpE9sYpYp898b3RZHV9doDQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionState"]
    ];
});
_c = AiSettingsForm;
var _c;
__turbopack_context__.k.register(_c, "AiSettingsForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/graphily/lib/ai/providers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiProviderIds",
    ()=>aiProviderIds,
    "aiProviders",
    ()=>aiProviders,
    "isAiProvider",
    ()=>isAiProvider,
    "isModelName",
    ()=>isModelName
]);
const aiProviders = {
    openai: {
        label: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        models: [
            "gpt-4o-mini",
            "gpt-4.1-mini",
            "gpt-4o"
        ],
        keyUrl: "https://platform.openai.com/api-keys"
    },
    groq: {
        label: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        models: [
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
            "llama-3.3-70b-versatile"
        ],
        keyUrl: "https://console.groq.com/keys"
    },
    gemini: {
        label: "Google Gemini",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
        models: [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.5-pro"
        ],
        keyUrl: "https://aistudio.google.com/apikey"
    },
    openrouter: {
        label: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1",
        models: [
            "openai/gpt-4o-mini",
            "anthropic/claude-sonnet-4",
            "google/gemini-2.5-flash"
        ],
        keyUrl: "https://openrouter.ai/keys"
    }
};
const aiProviderIds = Object.keys(aiProviders);
function isAiProvider(value) {
    return Object.hasOwn(aiProviders, value);
}
function isModelName(value) {
    return /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,119}$/.test(value);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=graphily_004s7wu5xnblf._.js.map