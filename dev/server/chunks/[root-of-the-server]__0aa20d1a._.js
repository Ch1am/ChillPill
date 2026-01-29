module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// In-memory storage for hackathon demo
// Prisma 7 adapter issues - using simple in-memory store instead
__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
// In-memory store
const negotiations = new Map();
let messageIdCounter = 0;
function generateId() {
    return `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function generateMessageId() {
    return `msg_${++messageIdCounter}`;
}
const prisma = {
    negotiation: {
        create: async (args)=>{
            const id = generateId();
            const now = new Date();
            const negotiation = {
                id,
                unitId: args.data.unitId,
                status: args.data.status,
                rounds: args.data.rounds || 0,
                createdAt: now,
                updatedAt: now,
                messages: []
            };
            negotiations.set(id, negotiation);
            console.log('[DB] Created negotiation:', id);
            return negotiation;
        },
        update: async (args)=>{
            const negotiation = negotiations.get(args.where.id);
            if (!negotiation) throw new Error('Negotiation not found');
            Object.assign(negotiation, args.data, {
                updatedAt: new Date()
            });
            console.log('[DB] Updated negotiation:', args.where.id, args.data);
            return negotiation;
        },
        findUnique: async (args)=>{
            const negotiation = negotiations.get(args.where.id);
            return negotiation || null;
        },
        findMany: async (args)=>{
            let results = Array.from(negotiations.values());
            if (args?.where?.unitId) {
                results = results.filter((n)=>n.unitId === args.where.unitId);
            }
            // Sort by createdAt descending
            results.sort((a, b)=>b.createdAt.getTime() - a.createdAt.getTime());
            return results;
        }
    },
    message: {
        create: async (args)=>{
            const negotiation = negotiations.get(args.data.negotiationId);
            if (!negotiation) throw new Error('Negotiation not found');
            const message = {
                id: generateMessageId(),
                negotiationId: args.data.negotiationId,
                role: args.data.role,
                content: args.data.content,
                proposal: args.data.proposal || null,
                createdAt: new Date()
            };
            negotiation.messages.push(message);
            console.log('[DB] Created message:', message.role);
            return message;
        },
        findMany: async (args)=>{
            const negotiation = negotiations.get(args.where.negotiationId);
            if (!negotiation) return [];
            return [
                ...negotiation.messages
            ];
        }
    }
};
}),
"[project]/src/lib/agents/resident-agent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateResidentProposal",
    ()=>generateResidentProposal,
    "respondToBlockAgent",
    ()=>respondToBlockAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/openai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
const RESIDENT_SYSTEM_PROMPT = `You are a Resident AI Agent for a household in an HDB block in Singapore. Your role is to:

1. ADVOCATE for your household's comfort while being mindful of collective sustainability
2. PROPOSE optimal cooling schedules based on household patterns and preferences
3. NEGOTIATE with the Block Agent when your proposals are countered
4. BALANCE personal comfort with community responsibility

Your household's needs are your priority, but you understand that cooperation benefits everyone.

When proposing or responding, always provide:
- A specific temperature (18-28°C)
- A time range (e.g., "18:00-22:00")
- Clear reasoning based on household context

Respond in JSON format:
{
  "action": "propose" | "accept" | "counter" | "reject",
  "proposal": {
    "temperature": number,
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "reason": "string"
  },
  "reasoning": "Your thought process explaining the decision"
}`;
async function generateResidentProposal(context) {
    console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Generating proposal for Unit', context.unitId);
    console.log('  Context:', JSON.stringify(context, null, 2));
    const prompt = `
Based on the following household context, propose an optimal cooling schedule:

Unit ID: ${context.unitId}
Household Size: ${context.householdSize} people
Preferred Temperature: ${context.preferredTemp}°C
Current Outdoor Temperature: ${context.currentOutdoorTemp}°C
Time of Day: ${context.timeOfDay}
Occupancy Pattern: ${context.occupancyPattern}

Generate a cooling proposal that balances comfort with energy efficiency.
`;
    const { text } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateText"])({
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"])('gpt-4o-mini'),
        system: RESIDENT_SYSTEM_PROMPT,
        prompt
    });
    console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Raw response:', text);
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const response = JSON.parse(cleanText);
        console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Proposing:', response.proposal ? `${response.proposal.temperature}°C from ${response.proposal.startTime}-${response.proposal.endTime}` : 'N/A');
        console.log('  Reasoning:', response.reasoning);
        return response;
    } catch  {
        // If JSON parsing fails, create a default response
        console.log('\x1b[33m[RESIDENT AGENT]\x1b[0m Failed to parse response, using defaults');
        return {
            action: 'propose',
            proposal: {
                temperature: context.preferredTemp,
                startTime: '18:00',
                endTime: '22:00',
                reason: 'Default proposal based on preferences'
            },
            reasoning: text
        };
    }
}
async function respondToBlockAgent(context, blockCounterProposal, originalProposal, round) {
    console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Reviewing counter-proposal from Block Agent');
    console.log('  Block suggests:', `${blockCounterProposal.temperature}°C from ${blockCounterProposal.startTime}-${blockCounterProposal.endTime}`);
    const prompt = `
You previously proposed:
- Temperature: ${originalProposal.temperature}°C
- Time: ${originalProposal.startTime} to ${originalProposal.endTime}
- Reason: ${originalProposal.reason}

The Block Agent has counter-proposed:
- Temperature: ${blockCounterProposal.temperature}°C
- Time: ${blockCounterProposal.startTime} to ${blockCounterProposal.endTime}
- Reason: ${blockCounterProposal.reason}

This is negotiation round ${round} of 3.

Your household context:
- Household Size: ${context.householdSize} people
- Preferred Temperature: ${context.preferredTemp}°C
- Current Outdoor Temperature: ${context.currentOutdoorTemp}°C

Decide whether to:
- ACCEPT the counter-proposal (if reasonable compromise)
- COUNTER with a middle-ground proposal (if there's room for negotiation)
- REJECT if the proposal is completely unacceptable

Remember: After round 3, the Block Agent's decision is final.
`;
    const { text } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateText"])({
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"])('gpt-4o-mini'),
        system: RESIDENT_SYSTEM_PROMPT,
        prompt
    });
    console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Raw response:', text);
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const response = JSON.parse(cleanText);
        console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Decision:', response.action.toUpperCase());
        if (response.proposal) {
            console.log('  Counter:', `${response.proposal.temperature}°C from ${response.proposal.startTime}-${response.proposal.endTime}`);
        }
        console.log('  Reasoning:', response.reasoning);
        return response;
    } catch  {
        // Default to accepting if parsing fails in later rounds
        console.log('\x1b[33m[RESIDENT AGENT]\x1b[0m Failed to parse response, accepting counter-proposal');
        return {
            action: 'accept',
            reasoning: 'Accepting counter-proposal as a reasonable compromise'
        };
    }
}
}),
"[project]/src/lib/agents/block-agent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluateCounterProposal",
    ()=>evaluateCounterProposal,
    "evaluateProposal",
    ()=>evaluateProposal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/openai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
const BLOCK_SYSTEM_PROMPT = `You are the HDB Block AI Agent responsible for coordinating cooling across all units in an HDB block in Singapore. Your role is to:

1. EVALUATE cooling proposals from individual Resident Agents
2. ASSESS collective impact on block-wide heat discharge and energy consumption
3. COORDINATE to prevent heat buildup in shared spaces and corridors
4. BALANCE individual comfort needs with block sustainability goals

You must consider:
- Peak demand hours (typically 14:00-19:00 in Singapore)
- Cumulative heat discharge from multiple units cooling simultaneously
- Urban heat island effect mitigation
- Overall block energy efficiency targets

When evaluating proposals:
- APPROVE if the proposal has minimal negative impact
- COUNTER with alternatives if there's room for optimization
- DENY only if the proposal would cause significant harm to block sustainability

Respond in JSON format:
{
  "decision": "approve" | "counter" | "deny",
  "counterProposal": {
    "temperature": number,
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "reason": "string"
  },
  "reasoning": "Your evaluation and decision process",
  "impactAssessment": {
    "heatContribution": "low" | "medium" | "high",
    "peakLoadImpact": "minimal" | "moderate" | "significant",
    "recommendedAction": "brief suggestion for the resident"
  }
}`;
async function evaluateProposal(blockContext, unitId, proposal) {
    console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Evaluating proposal from Unit', unitId);
    console.log('  Proposal:', `${proposal.temperature}°C from ${proposal.startTime}-${proposal.endTime}`);
    console.log('  Block Status:', JSON.stringify(blockContext, null, 2));
    const prompt = `
A Resident Agent from Unit ${unitId} has submitted a cooling proposal:

Proposed Schedule:
- Temperature: ${proposal.temperature}°C
- Time Range: ${proposal.startTime} to ${proposal.endTime}
- Resident's Reason: ${proposal.reason}

Current Block Status:
- Block ID: ${blockContext.blockId}
- Total Units: ${blockContext.totalUnits}
- Currently Active AC Units: ${blockContext.activeUnits}
- Block Heat Index: ${blockContext.currentHeatIndex}/100 (${blockContext.currentHeatIndex > 70 ? 'HIGH' : blockContext.currentHeatIndex > 40 ? 'MODERATE' : 'LOW'})
- Peak Hours Today: ${blockContext.peakHours.join(', ')}
- Average Block Temperature: ${blockContext.avgBlockTemp}°C
- Current Outdoor Temperature: ${blockContext.outdoorTemp}°C

Evaluate this proposal considering:
1. Will this temperature setting contribute significantly to corridor/block heat?
2. Does the timing overlap with peak demand?
3. Are there alternative schedules that could achieve similar comfort with less impact?

Make your decision.
`;
    const { text } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateText"])({
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"])('gpt-4o-mini'),
        system: BLOCK_SYSTEM_PROMPT,
        prompt
    });
    console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Raw response:', text);
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const response = JSON.parse(cleanText);
        console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Decision:', response.decision.toUpperCase());
        if (response.counterProposal) {
            console.log('  Counter-proposal:', `${response.counterProposal.temperature}°C from ${response.counterProposal.startTime}-${response.counterProposal.endTime}`);
        }
        console.log('  Reasoning:', response.reasoning);
        console.log('  Impact:', response.impactAssessment);
        return response;
    } catch  {
        // Default response if parsing fails
        console.log('\x1b[33m[BLOCK AGENT]\x1b[0m Failed to parse response, approving by default');
        return {
            decision: 'approve',
            reasoning: 'Proposal appears reasonable based on current block conditions',
            impactAssessment: {
                heatContribution: 'low',
                peakLoadImpact: 'minimal',
                recommendedAction: 'Proceed with proposed schedule'
            }
        };
    }
}
async function evaluateCounterProposal(blockContext, unitId, residentCounter, previousBlockSuggestion, round) {
    console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Evaluating counter from Unit', unitId, '(Round', round, ')');
    const prompt = `
The Resident Agent from Unit ${unitId} has counter-proposed after you suggested changes:

Your Previous Suggestion:
- Temperature: ${previousBlockSuggestion.temperature}°C
- Time Range: ${previousBlockSuggestion.startTime} to ${previousBlockSuggestion.endTime}
- Your Reason: ${previousBlockSuggestion.reason}

Resident's Counter-Proposal:
- Temperature: ${residentCounter.temperature}°C
- Time Range: ${residentCounter.startTime} to ${residentCounter.endTime}
- Their Reason: ${residentCounter.reason}

Current Block Status:
- Block Heat Index: ${blockContext.currentHeatIndex}/100
- Active AC Units: ${blockContext.activeUnits}/${blockContext.totalUnits}
- Peak Hours: ${blockContext.peakHours.join(', ')}

This is negotiation round ${round} of 3. ${round === 3 ? 'This is the FINAL round - you must make a definitive decision.' : 'Consider finding middle ground if possible.'}

Evaluate and decide.
`;
    const { text } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateText"])({
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"])('gpt-4o-mini'),
        system: BLOCK_SYSTEM_PROMPT,
        prompt
    });
    console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Raw response:', text);
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const response = JSON.parse(cleanText);
        console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Decision:', response.decision.toUpperCase());
        return response;
    } catch  {
        // In final round, approve by default
        console.log('\x1b[33m[BLOCK AGENT]\x1b[0m Failed to parse response, approving counter');
        return {
            decision: 'approve',
            reasoning: 'Accepting resident counter-proposal as reasonable compromise',
            impactAssessment: {
                heatContribution: 'medium',
                peakLoadImpact: 'moderate',
                recommendedAction: 'Monitor usage and adjust if needed'
            }
        };
    }
}
}),
"[project]/src/lib/negotiation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNegotiation",
    ()=>getNegotiation,
    "listNegotiations",
    ()=>listNegotiations,
    "startNegotiation",
    ()=>startNegotiation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agents$2f$resident$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/agents/resident-agent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agents$2f$block$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/agents/block-agent.ts [app-route] (ecmascript)");
;
;
;
const MAX_ROUNDS = 3;
// Console logging helpers with colors
const log = {
    negotiation: (msg)=>console.log(`\x1b[33m[NEGOTIATION]\x1b[0m ${msg}`),
    success: (msg)=>console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
    error: (msg)=>console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
    divider: ()=>console.log('\x1b[90m' + '─'.repeat(60) + '\x1b[0m')
};
async function startNegotiation(residentContext, blockContext) {
    log.divider();
    log.negotiation(`Starting negotiation for Unit ${residentContext.unitId}`);
    log.divider();
    // Create negotiation record in database
    const negotiation = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].negotiation.create({
        data: {
            unitId: residentContext.unitId,
            status: 'pending',
            rounds: 0
        }
    });
    log.negotiation(`Negotiation ID: ${negotiation.id}`);
    try {
        // Step 1: Resident Agent generates initial proposal
        log.divider();
        const residentResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agents$2f$resident$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateResidentProposal"])(residentContext);
        if (!residentResponse.proposal) {
            throw new Error('Resident Agent failed to generate proposal');
        }
        // Store resident's proposal
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
            data: {
                negotiationId: negotiation.id,
                role: 'resident_agent',
                content: residentResponse.reasoning,
                proposal: JSON.stringify(residentResponse.proposal)
            }
        });
        let currentProposal = residentResponse.proposal;
        let round = 1;
        let finalStatus = 'pending';
        // Negotiation loop
        while(round <= MAX_ROUNDS){
            log.divider();
            log.negotiation(`Round ${round}/${MAX_ROUNDS}`);
            // Step 2: Block Agent evaluates
            const blockResponse = round === 1 ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agents$2f$block$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateProposal"])(blockContext, residentContext.unitId, currentProposal) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agents$2f$block$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateCounterProposal"])(blockContext, residentContext.unitId, currentProposal, currentProposal, round);
            // Store block agent's response
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
                data: {
                    negotiationId: negotiation.id,
                    role: 'block_agent',
                    content: blockResponse.reasoning,
                    proposal: blockResponse.counterProposal ? JSON.stringify(blockResponse.counterProposal) : null
                }
            });
            // Handle block agent's decision
            if (blockResponse.decision === 'approve') {
                log.success(`Proposal APPROVED by Block Agent in round ${round}`);
                finalStatus = 'approved';
                break;
            }
            if (blockResponse.decision === 'deny') {
                log.error(`Proposal DENIED by Block Agent in round ${round}`);
                finalStatus = 'denied';
                break;
            }
            // Block agent countered
            if (blockResponse.decision === 'counter' && blockResponse.counterProposal) {
                log.negotiation(`Block Agent COUNTERED with: ${blockResponse.counterProposal.temperature}°C`);
                // Final round - block agent's decision is final
                if (round === MAX_ROUNDS) {
                    log.negotiation('Final round reached - Block Agent decision is final');
                    currentProposal = blockResponse.counterProposal;
                    finalStatus = 'countered';
                    break;
                }
                // Step 3: Resident Agent responds to counter
                log.divider();
                const residentCounterResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agents$2f$resident$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["respondToBlockAgent"])(residentContext, blockResponse.counterProposal, currentProposal, round);
                // Store resident's response
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
                    data: {
                        negotiationId: negotiation.id,
                        role: 'resident_agent',
                        content: residentCounterResponse.reasoning,
                        proposal: residentCounterResponse.proposal ? JSON.stringify(residentCounterResponse.proposal) : null
                    }
                });
                if (residentCounterResponse.action === 'accept') {
                    log.success(`Resident ACCEPTED Block Agent's counter-proposal`);
                    currentProposal = blockResponse.counterProposal;
                    finalStatus = 'accepted';
                    break;
                }
                if (residentCounterResponse.action === 'reject') {
                    log.error(`Resident REJECTED Block Agent's counter-proposal`);
                    // Continue to next round with original proposal
                    round++;
                    continue;
                }
                if (residentCounterResponse.action === 'counter' && residentCounterResponse.proposal) {
                    log.negotiation(`Resident COUNTERED with: ${residentCounterResponse.proposal.temperature}°C`);
                    currentProposal = residentCounterResponse.proposal;
                }
            }
            round++;
        }
        // Update negotiation status
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].negotiation.update({
            where: {
                id: negotiation.id
            },
            data: {
                status: finalStatus,
                rounds: round
            }
        });
        // Fetch all messages
        const messages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.findMany({
            where: {
                negotiationId: negotiation.id
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        log.divider();
        log.negotiation(`Negotiation COMPLETED: ${finalStatus.toUpperCase()} after ${round} round(s)`);
        log.divider();
        return {
            negotiationId: negotiation.id,
            status: finalStatus,
            rounds: round,
            finalProposal: currentProposal,
            messages: messages.map((m)=>({
                    role: m.role,
                    content: m.content,
                    proposal: m.proposal ?? undefined
                }))
        };
    } catch (error) {
        log.error(`Negotiation failed: ${error}`);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].negotiation.update({
            where: {
                id: negotiation.id
            },
            data: {
                status: 'denied'
            }
        });
        throw error;
    }
}
async function getNegotiation(negotiationId) {
    const negotiation = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].negotiation.findUnique({
        where: {
            id: negotiationId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });
    return negotiation;
}
async function listNegotiations(unitId) {
    const negotiations = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].negotiation.findMany({
        where: unitId ? {
            unitId
        } : undefined,
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return negotiations;
}
}),
"[project]/src/app/api/negotiate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$negotiation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/negotiation.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        // Extract resident context from request or use defaults
        const residentContext = {
            unitId: body.unitId || '12-345',
            householdSize: body.householdSize || 3,
            preferredTemp: body.preferredTemp || 24,
            currentOutdoorTemp: body.outdoorTemp || 32,
            timeOfDay: body.timeOfDay || new Date().toLocaleTimeString('en-SG', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            occupancyPattern: body.occupancyPattern || 'Family returns home around 18:00, children do homework, dinner at 19:00'
        };
        // Block context - simulated data for the HDB block
        const blockContext = {
            blockId: body.blockId || 'BLK-123A',
            totalUnits: 248,
            activeUnits: Math.floor(Math.random() * 100) + 80,
            currentHeatIndex: Math.floor(Math.random() * 40) + 40,
            peakHours: [
                '14:00',
                '15:00',
                '16:00',
                '17:00',
                '18:00',
                '19:00'
            ],
            avgBlockTemp: 24.5,
            outdoorTemp: residentContext.currentOutdoorTemp
        };
        console.log('\n\x1b[44m\x1b[37m ═══ NEW NEGOTIATION REQUEST ═══ \x1b[0m\n');
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$negotiation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startNegotiation"])(residentContext, blockContext);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Negotiation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0aa20d1a._.js.map