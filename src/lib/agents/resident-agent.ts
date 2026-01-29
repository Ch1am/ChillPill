import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface CoolingProposal {
  temperature: number;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface ResidentContext {
  unitId: string;
  householdSize: number;
  preferredTemp: number;
  currentOutdoorTemp: number;
  timeOfDay: string;
  occupancyPattern: string;
}

export interface ResidentAgentResponse {
  action: 'propose' | 'accept' | 'counter' | 'reject';
  proposal?: CoolingProposal;
  reasoning: string;
}

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

export async function generateResidentProposal(
  context: ResidentContext
): Promise<ResidentAgentResponse> {
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

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: RESIDENT_SYSTEM_PROMPT,
    prompt,
  });

  console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Raw response:', text);

  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const response = JSON.parse(cleanText) as ResidentAgentResponse;
    console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Proposing:', 
      response.proposal ? `${response.proposal.temperature}°C from ${response.proposal.startTime}-${response.proposal.endTime}` : 'N/A');
    console.log('  Reasoning:', response.reasoning);
    return response;
  } catch {
    // If JSON parsing fails, create a default response
    console.log('\x1b[33m[RESIDENT AGENT]\x1b[0m Failed to parse response, using defaults');
    return {
      action: 'propose',
      proposal: {
        temperature: context.preferredTemp,
        startTime: '18:00',
        endTime: '22:00',
        reason: 'Default proposal based on preferences',
      },
      reasoning: text,
    };
  }
}

export async function respondToBlockAgent(
  context: ResidentContext,
  blockCounterProposal: CoolingProposal,
  originalProposal: CoolingProposal,
  round: number
): Promise<ResidentAgentResponse> {
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

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: RESIDENT_SYSTEM_PROMPT,
    prompt,
  });

  console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Raw response:', text);

  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const response = JSON.parse(cleanText) as ResidentAgentResponse;
    console.log('\x1b[36m[RESIDENT AGENT]\x1b[0m Decision:', response.action.toUpperCase());
    if (response.proposal) {
      console.log('  Counter:', `${response.proposal.temperature}°C from ${response.proposal.startTime}-${response.proposal.endTime}`);
    }
    console.log('  Reasoning:', response.reasoning);
    return response;
  } catch {
    // Default to accepting if parsing fails in later rounds
    console.log('\x1b[33m[RESIDENT AGENT]\x1b[0m Failed to parse response, accepting counter-proposal');
    return {
      action: 'accept',
      reasoning: 'Accepting counter-proposal as a reasonable compromise',
    };
  }
}
