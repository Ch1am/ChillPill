import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { CoolingProposal } from './resident-agent';

export interface BlockContext {
  blockId: string;
  totalUnits: number;
  activeUnits: number;
  currentHeatIndex: number; // 0-100 scale
  peakHours: string[];
  avgBlockTemp: number;
  outdoorTemp: number;
}

export interface BlockAgentResponse {
  decision: 'approve' | 'counter' | 'deny';
  counterProposal?: CoolingProposal;
  reasoning: string;
  impactAssessment: {
    heatContribution: string;
    peakLoadImpact: string;
    recommendedAction: string;
  };
}

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

export async function evaluateProposal(
  blockContext: BlockContext,
  unitId: string,
  proposal: CoolingProposal
): Promise<BlockAgentResponse> {
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

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: BLOCK_SYSTEM_PROMPT,
    prompt,
  });

  console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Raw response:', text);

  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const response = JSON.parse(cleanText) as BlockAgentResponse;
    console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Decision:', response.decision.toUpperCase());
    if (response.counterProposal) {
      console.log('  Counter-proposal:', `${response.counterProposal.temperature}°C from ${response.counterProposal.startTime}-${response.counterProposal.endTime}`);
    }
    console.log('  Reasoning:', response.reasoning);
    console.log('  Impact:', response.impactAssessment);
    return response;
  } catch {
    // Default response if parsing fails
    console.log('\x1b[33m[BLOCK AGENT]\x1b[0m Failed to parse response, approving by default');
    return {
      decision: 'approve',
      reasoning: 'Proposal appears reasonable based on current block conditions',
      impactAssessment: {
        heatContribution: 'low',
        peakLoadImpact: 'minimal',
        recommendedAction: 'Proceed with proposed schedule',
      },
    };
  }
}

export async function evaluateCounterProposal(
  blockContext: BlockContext,
  unitId: string,
  residentCounter: CoolingProposal,
  previousBlockSuggestion: CoolingProposal,
  round: number
): Promise<BlockAgentResponse> {
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

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: BLOCK_SYSTEM_PROMPT,
    prompt,
  });

  console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Raw response:', text);

  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const response = JSON.parse(cleanText) as BlockAgentResponse;
    console.log('\x1b[35m[BLOCK AGENT]\x1b[0m Decision:', response.decision.toUpperCase());
    return response;
  } catch {
    // In final round, approve by default
    console.log('\x1b[33m[BLOCK AGENT]\x1b[0m Failed to parse response, approving counter');
    return {
      decision: 'approve',
      reasoning: 'Accepting resident counter-proposal as reasonable compromise',
      impactAssessment: {
        heatContribution: 'medium',
        peakLoadImpact: 'moderate',
        recommendedAction: 'Monitor usage and adjust if needed',
      },
    };
  }
}
