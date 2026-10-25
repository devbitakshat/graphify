(()=>{"use strict";module.exports = [
"[project]/graphily/.next-internal/server/app/(study)/settings/page/actions.js { ACTIONS_MODULE0 => \"[project]/graphily/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/graphily/app/actions/spaces.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/graphily/app/actions/concepts.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/graphily/app/actions/ai-settings.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "009d07fce2ad360a2ddd5e091ad5e9dbd49dae8aac",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["logout"],
    "408a1f3b9d63a67018cb5c63411021c6e73d5da88b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$spaces$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteSpaceAction"],
    "60046ef876878072844e1ec00e2b1cabb70061c6a3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$spaces$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateSpaceAction"],
    "600a9aa06464c63b9326c9253c314b618fc55e30e9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$ai$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveAiSettingsAction"],
    "6049ab136bb390a4ef7cc23061891afa134e6f41b8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$spaces$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSpaceAction"],
    "605ee5063cbe353d6cdb0f925c36b7c92c9f33fbf6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["login"],
    "60b9ca536902da7ab2e2c150d8b3b117649b0fd49d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signup"],
    "60ff9863bec55a1899e6690ea204513ce38e646ded",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$concepts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addConceptAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f2e$next$2d$internal$2f$server$2f$app$2f28$study$292f$settings$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$graphily$2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$graphily$2f$app$2f$actions$2f$spaces$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$graphily$2f$app$2f$actions$2f$concepts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$graphily$2f$app$2f$actions$2f$ai$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/graphily/.next-internal/server/app/(study)/settings/page/actions.js { ACTIONS_MODULE0 => "[project]/graphily/app/actions/auth.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/graphily/app/actions/spaces.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/graphily/app/actions/concepts.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/graphily/app/actions/ai-settings.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$spaces$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/spaces.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$concepts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/concepts.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$ai$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/ai-settings.ts [app-rsc] (ecmascript)");
}),
"[project]/graphily/.next-internal/server/app/(study)/settings/page/actions.js { ACTIONS_MODULE0 => \"[project]/graphily/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/graphily/app/actions/spaces.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/graphily/app/actions/concepts.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/graphily/app/actions/ai-settings.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$spaces$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/spaces.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$concepts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/concepts.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$app$2f$actions$2f$ai$2d$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/app/actions/ai-settings.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/graphily/app/actions/ai-settings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"600a9aa06464c63b9326c9253c314b618fc55e30e9":{"name":"saveAiSettingsAction"}},"graphily/app/actions/ai-settings.ts",""] */ __turbopack_context__.s([
    "saveAiSettingsAction",
    ()=>saveAiSettingsAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/ai/providers.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/ai/settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/auth/current-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$safe$2d$next$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/auth/safe-next.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/forms.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$graph$2f$llm$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/graph/llm.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
async function saveAiSettingsAction(_state, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "provider");
    const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "model");
    const typedKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "apiKey");
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$safe$2d$next$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safeNext"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "next"));
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAiProvider"])(provider)) return {
        error: "Choose a provider."
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isModelName"])(model)) return {
        error: "Enter a model name, for example gpt-4o-mini."
    };
    if (typedKey.length > 400 || /\s/.test(typedKey)) return {
        error: "That API key does not look right."
    };
    let apiKey = typedKey;
    if (!apiKey) {
        const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAiConfig"])(user.id);
        if (!current || current.provider !== provider) return {
            error: "Paste your API key."
        };
        apiKey = current.apiKey;
    }
    const problem = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$graph$2f$llm$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyModelAccess"])({
        provider,
        baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["aiProviders"][provider].baseUrl,
        model,
        apiKey
    });
    if (problem) return {
        error: problem
    };
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveAiSettings"])(user.id, {
            provider,
            model,
            apiKey
        });
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Could not save your settings."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(next);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveAiSettingsAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveAiSettingsAction, "600a9aa06464c63b9326c9253c314b618fc55e30e9", null);
}),
"[project]/graphily/app/actions/concepts.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4094eae06137b9d2b0a0737fe69e543060d823db09":{"name":"removeConceptAction"},"40e52266f5fb14612e42f8caaf3084faa17a197086":{"name":"removeRelationshipAction"},"6069aad8425611215d1fdc3c43a692f451922d89b9":{"name":"addRelationshipAction"},"606d4994b02dd2bbaed8708bf763ff51f3d8ace723":{"name":"updateConceptAction"},"60c2fb2263924910bc5aed3a973c15ab7b24a7e44a":{"name":"setStatusAction"},"60ff9863bec55a1899e6690ea204513ce38e646ded":{"name":"addConceptAction"},"709b63293e9379fe787650ee1805433722ec99493a":{"name":"savePositionAction"}},"graphily/app/actions/concepts.ts",""] */ __turbopack_context__.s([
    "addConceptAction",
    ()=>addConceptAction,
    "addRelationshipAction",
    ()=>addRelationshipAction,
    "removeConceptAction",
    ()=>removeConceptAction,
    "removeRelationshipAction",
    ()=>removeRelationshipAction,
    "savePositionAction",
    ()=>savePositionAction,
    "setStatusAction",
    ()=>setStatusAction,
    "updateConceptAction",
    ()=>updateConceptAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/auth/current-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/data/repository.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/domain.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/forms.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/revalidate-space.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function addConceptAction(_state, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const spaceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "spaceId");
    const title = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "title");
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "status");
    const note = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "note");
    const parentId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "parentId");
    const urlResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanUrl"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "url"));
    if (!urlResult.ok) return {
        error: urlResult.error
    };
    if (title.length < 1 || title.length > 120) return {
        error: "Enter a concept name."
    };
    if (note.length > 500) return {
        error: "Keep the note under 500 characters."
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["statuses"], status)) return {
        error: "Choose a knowledge state."
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createConcept"])(user.id, spaceId, {
        title,
        status,
        url: urlResult.url,
        note,
        parentId: parentId || null
    });
    if (result?.error) return result;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(spaceId);
    return {
        ok: true,
        savedAt: Date.now()
    };
}
async function updateConceptAction(conceptId, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const title = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "title");
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "status");
    const priority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "priority");
    const note = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "note");
    const parentId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "parentId");
    const urlResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanUrl"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "url"));
    if (!urlResult.ok) return {
        error: urlResult.error
    };
    if (title.length < 1 || title.length > 120) return {
        error: "Enter a concept name."
    };
    if (note.length > 500) return {
        error: "Keep the note under 500 characters."
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["statuses"], status) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["priorities"], priority)) {
        return {
            error: "Choose a status and priority."
        };
    }
    const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateConcept"])(user.id, conceptId, {
        title,
        status: status,
        priority: priority,
        url: urlResult.url,
        note,
        parentId: parentId || null
    });
    if (!("spaceId" in saved) || !saved.spaceId) {
        return {
            error: "error" in saved && saved.error ? saved.error : "Could not save the concept."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(saved.spaceId);
    return null;
}
async function setStatusAction(conceptId, status) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["statuses"], status)) return {
        error: "Choose a knowledge state."
    };
    const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setConceptStatus"])(user.id, conceptId, status);
    if (!("spaceId" in saved) || !saved.spaceId) {
        return {
            error: "error" in saved && saved.error ? saved.error : "Could not update the status."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(saved.spaceId);
    return null;
}
async function removeConceptAction(conceptId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const removed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConcept"])(user.id, conceptId);
    if (!("spaceId" in removed) || !removed.spaceId) {
        return {
            error: "error" in removed && removed.error ? removed.error : "Could not remove the concept."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(removed.spaceId);
    return null;
}
async function savePositionAction(conceptId, x, y) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveNodePosition"])(user.id, conceptId, x, y);
}
async function addRelationshipAction(spaceId, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const sourceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "sourceId");
    const targetId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "targetId");
    const relationship = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "relationship");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["relationships"], relationship)) return {
        error: "Choose what this relationship means."
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createRelationship"])(user.id, spaceId, sourceId, targetId, relationship);
    if (result?.error) return result;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(spaceId);
    return null;
}
async function removeRelationshipAction(edgeId) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const removed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeRelationship"])(user.id, edgeId);
    if (!("spaceId" in removed) || !removed.spaceId) {
        return {
            error: "error" in removed && removed.error ? removed.error : "Could not remove the relationship."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(removed.spaceId);
    return null;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    addConceptAction,
    updateConceptAction,
    setStatusAction,
    removeConceptAction,
    savePositionAction,
    addRelationshipAction,
    removeRelationshipAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addConceptAction, "60ff9863bec55a1899e6690ea204513ce38e646ded", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateConceptAction, "606d4994b02dd2bbaed8708bf763ff51f3d8ace723", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setStatusAction, "60c2fb2263924910bc5aed3a973c15ab7b24a7e44a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeConceptAction, "4094eae06137b9d2b0a0737fe69e543060d823db09", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(savePositionAction, "709b63293e9379fe787650ee1805433722ec99493a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addRelationshipAction, "6069aad8425611215d1fdc3c43a692f451922d89b9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeRelationshipAction, "40e52266f5fb14612e42f8caaf3084faa17a197086", null);
}),
"[project]/graphily/app/actions/spaces.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"408a1f3b9d63a67018cb5c63411021c6e73d5da88b":{"name":"deleteSpaceAction"},"60046ef876878072844e1ec00e2b1cabb70061c6a3":{"name":"updateSpaceAction"},"6049ab136bb390a4ef7cc23061891afa134e6f41b8":{"name":"createSpaceAction"}},"graphily/app/actions/spaces.ts",""] */ __turbopack_context__.s([
    "createSpaceAction",
    ()=>createSpaceAction,
    "deleteSpaceAction",
    ()=>deleteSpaceAction,
    "updateSpaceAction",
    ()=>updateSpaceAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/ai/settings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/auth/current-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/data/repository.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/domain.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/forms.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/revalidate-space.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
function settingsFromForm(formData) {
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "name");
    const goal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "goal");
    const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "level");
    const depth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "depth");
    const timeAvailable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "timeAvailable");
    const resourcePreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "resourcePreference");
    if (name.length < 1 || name.length > 80) return {
        ok: false,
        error: "Name the learning space."
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["goals"], goal) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["levels"], level) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["depths"], depth)) {
        return {
            ok: false,
            error: "Choose a goal, level, and depth."
        };
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["timeOptions"], timeAvailable)) return {
        ok: false,
        error: "Choose how much time you have."
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOneOf"])(__TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$domain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["preferences"], resourcePreference)) return {
        ok: false,
        error: "Choose a resource preference."
    };
    return {
        ok: true,
        value: {
            name,
            goal: goal,
            level: level,
            depth: depth,
            timeAvailable,
            resourcePreference: resourcePreference
        }
    };
}
async function createSpaceAction(_state, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$ai$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAiSummary"])(user.id)) return {
        error: "Add your AI model and API key in settings first."
    };
    const settings = settingsFromForm(formData);
    if (!settings.ok) return {
        error: settings.error
    };
    const space = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSpace"])(user.id, settings.value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/spaces/${space.id}/graph`);
}
async function updateSpaceAction(_state, formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const spaceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "spaceId");
    const settings = settingsFromForm(formData);
    if (!settings.ok) return {
        error: settings.error
    };
    const space = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateSpace"])(user.id, spaceId, settings.value);
    if (!space) return {
        error: "Learning space not found."
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(space.id);
    return null;
}
async function deleteSpaceAction(formData) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$auth$2f$current$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireUser"])();
    const spaceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$forms$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readString"])(formData, "spaceId");
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$data$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteSpace"])(user.id, spaceId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$revalidate$2d$space$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidateSpace"])(spaceId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/dashboard");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createSpaceAction,
    updateSpaceAction,
    deleteSpaceAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createSpaceAction, "6049ab136bb390a4ef7cc23061891afa134e6f41b8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateSpaceAction, "60046ef876878072844e1ec00e2b1cabb70061c6a3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteSpaceAction, "408a1f3b9d63a67018cb5c63411021c6e73d5da88b", null);
}),
"[project]/graphily/lib/forms.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanUrl",
    ()=>cleanUrl,
    "readString",
    ()=>readString
]);
function readString(formData, key) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}
function cleanUrl(value) {
    if (!value) return {
        ok: true,
        url: ""
    };
    try {
        const url = new URL(value);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return {
                ok: false,
                error: "Use an http or https link."
            };
        }
        return {
            ok: true,
            url: url.toString()
        };
    } catch  {
        return {
            ok: false,
            error: "Use an http or https link."
        };
    }
}
}),
"[project]/graphily/lib/graph/llm.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatEndpoint",
    ()=>chatEndpoint,
    "defineWithModel",
    ()=>defineWithModel,
    "groqReasoningModel",
    ()=>groqReasoningModel,
    "parseDefinition",
    ()=>parseDefinition,
    "planWithModel",
    ()=>planWithModel,
    "verifyModelAccess",
    ()=>verifyModelAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$graph$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/lib/graph/schema.ts [app-rsc] (ecmascript)");
;
const systemPrompt = `You build a personal knowledge-gap graph for a learning space. Return JSON only.
Rules:
- If captured titles are provided, include every captured title exactly once, with type "captured". Never drop a captured concept.
- If captured is empty, seed the graph from spaceName:
  1) Include exactly one overview node whose title equals spaceName, type "suggested", with explanation = a 1–2 sentence plain definition of the topic and whyItMatters for a learner.
  2) Add related prerequisite and suggested nodes around it (not titled spaceName). Use type "suggested" or "prerequisite" only (never "captured").
- Add only the missing prerequisites and closely related concepts that fit the goal, level, depth, and time budget.
- Do not invent resource URLs.
- Every prerequisite node needs prerequisiteReason: why that concept is necessary before another.
- relationship must be exactly one of: required for, is a type of, uses, supports, part of, same as, demonstrates.
- Direction: "HTTP" required for "REST API". "REST API" is a type of "API". "Authentication" uses "JWT". "Caching" supports "Scalability". "Load balancing" part of "System Design".
- learningOrder lists every node id. A concept that is required for another comes first.
- Prefer must-know prerequisites over nice-to-know topics. Stay within nodeBudget nodes beyond the captured ones (or within nodeBudget total when captured is empty).
- type is captured, prerequisite, suggested, or project. priority is must, should, nice, or out_of_scope.
- Each node needs a short explanation (1–2 sentences) suitable for a graph bubble.
Shape: {"nodes":[{"id":"","title":"","type":"captured","priority":"must","explanation":"","whyItMatters":"","goalRelationship":"","example":"","effort":"","prerequisiteReason":""}],"edges":[{"source":"","target":"","relationship":"required for"}],"learningOrder":[]}`;
function extractJson(text) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const source = (fenced ? fenced[1] : text).trim();
    try {
        return JSON.parse(source);
    } catch  {
        const start = source.indexOf("{");
        const end = source.lastIndexOf("}");
        if (start < 0 || end <= start) throw new Error("not json");
        return JSON.parse(source.slice(start, end + 1));
    }
}
function groqReasoningModel(model, base) {
    return /gpt-oss|groq\.com/i.test(`${model} ${base}`);
}
function chatEndpoint(config) {
    return `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
}
async function complete(config, input, correction) {
    const base = config.baseUrl.replace(/\/$/, "");
    const model = config.model;
    // Groq's gpt-oss models think in a separate channel. Strict JSON mode
    // rejects that draft with HTTP 400 before we can read it.
    const groqReasoning = groqReasoningModel(model, base);
    const response = await fetch(chatEndpoint(config), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            temperature: 0.2,
            ...groqReasoning ? {
                reasoning_format: "hidden",
                reasoning_effort: "low",
                max_completion_tokens: 8192
            } : {
                response_format: {
                    type: "json_object"
                }
            },
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        spaceName: input.spaceName,
                        goal: input.goal,
                        level: input.level,
                        depth: input.depth,
                        timeAvailable: input.timeAvailable,
                        nodeBudget: Math.max(input.captured.length + 12, 8),
                        captured: input.captured,
                        seedFromSpace: input.captured.length === 0,
                        correction
                    })
                }
            ]
        }),
        signal: AbortSignal.timeout(60000)
    });
    if (!response.ok) {
        let detail = "";
        let failedGeneration = "";
        try {
            const err = await response.json();
            detail = err.error?.message || err.error?.code || "";
            failedGeneration = err.error?.failed_generation ?? "";
        } catch  {
        /* ignore parse failures */ }
        if (failedGeneration) {
            try {
                extractJson(failedGeneration);
                return failedGeneration;
            } catch  {
            /* the draft was not usable JSON */ }
        }
        throw new Error(detail ? `The model request failed (${response.status}: ${detail}). Nothing was saved.` : `The model request failed (${response.status}). Nothing was saved.`);
    }
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("The model returned an empty response. Nothing was saved.");
    return content;
}
const definitionPrompt = `You explain one topic for a learner looking at a knowledge graph. Return JSON only: {"definition":"","more":""}.
definition: one or two plain sentences, under 180 characters, saying what the topic is.
more: two or three short sentences with a concrete example or why it matters. Under 420 characters.
No markdown, no labels, no mention of these instructions.`;
function parseDefinition(value) {
    if (!value || typeof value !== "object") return null;
    const record = value;
    const definition = typeof record.definition === "string" ? record.definition.replace(/\s+/g, " ").trim().slice(0, 220) : "";
    const more = typeof record.more === "string" ? record.more.replace(/\s+/g, " ").trim().slice(0, 500) : "";
    if (definition.length < 12 || more.length < 12) return null;
    return {
        definition,
        more
    };
}
async function defineWithModel(config, input) {
    if (!config) {
        throw new Error("Add your AI model and API key in settings to generate definitions.");
    }
    const model = config.model;
    const reasoningJson = groqReasoningModel(model, config.baseUrl) ? {
        reasoning_format: "hidden",
        reasoning_effort: "low",
        max_completion_tokens: 1024
    } : {};
    const response = await fetch(chatEndpoint(config), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            temperature: 0.3,
            ...reasoningJson,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: definitionPrompt
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        title: input.title,
                        spaceName: input.spaceName,
                        level: input.level
                    })
                }
            ]
        }),
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`The model request failed (${response.status}).`);
    }
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("The model returned an empty definition.");
    let raw;
    try {
        raw = extractJson(content);
    } catch  {
        throw new Error("The model definition was not valid JSON.");
    }
    const parsed = parseDefinition(raw);
    if (!parsed) throw new Error("The model definition was too short to use.");
    return parsed;
}
async function verifyModelAccess(config) {
    let response;
    try {
        response = await fetch(chatEndpoint(config), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    {
                        role: "user",
                        content: "Reply with the word ok."
                    }
                ]
            }),
            signal: AbortSignal.timeout(20000)
        });
    } catch  {
        return "Could not reach the provider. Check your connection and try again.";
    }
    if (response.ok) return null;
    let detail = "";
    try {
        const err = await response.json();
        detail = (Array.isArray(err) ? err[0]?.error?.message : err.error?.message) ?? "";
    } catch  {
    /* ignore parse failures */ }
    if (response.status === 401 || response.status === 403) {
        return `The provider rejected that API key (${response.status}).`;
    }
    return detail ? `The provider refused the request (${response.status}: ${detail.slice(0, 200)}).` : `The provider refused the request (${response.status}). Check the model name.`;
}
async function planWithModel(config, input) {
    let correction;
    for(let attempt = 0; attempt < 2; attempt += 1){
        const content = await complete(config, input, correction);
        let raw;
        try {
            raw = extractJson(content);
        } catch  {
            correction = "Return one JSON object only, with nodes, edges, and learningOrder.";
            continue;
        }
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$graph$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphPlanSchema"].safeParse((0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$lib$2f$graph$2f$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clampPlanInput"])(raw));
        if (parsed.success) return parsed.data;
        correction = "The previous JSON failed validation. Keep the same shape and shorten any long text fields.";
    }
    throw new Error("The model response did not match the graph schema, so nothing was saved.");
}
}),
"[project]/graphily/lib/revalidate-space.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "revalidateSpace",
    ()=>revalidateSpace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/graphily/node_modules/next/cache.js [app-rsc] (ecmascript)");
;
function revalidateSpace(spaceId) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/spaces/${spaceId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$graphily$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/spaces/${spaceId}/graph`);
}
}),
];})()

//# sourceMappingURL=graphily_20-198u8ex5km._.js.map