import { prisma } from './db';
import {
  generateResidentProposal,
  respondToBlockAgent,
  ResidentContext,
  CoolingProposal,
} from './agents/resident-agent';
import {
  evaluateProposal,
  evaluateCounterProposal,
  BlockContext,
} from './agents/block-agent';

export interface NegotiationResult {
  negotiationId: string;
  status: 'approved' | 'denied' | 'accepted' | 'countered';
  rounds: number;
  finalProposal?: CoolingProposal;
  messages: Array<{
    role: string;
    content: string;
    proposal?: string;
  }>;
}

const MAX_ROUNDS = 3;

// Console logging helpers with colors
const log = {
  negotiation: (msg: string) => console.log(`\x1b[33m[NEGOTIATION]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  divider: () => console.log('\x1b[90m' + '─'.repeat(60) + '\x1b[0m'),
};

export async function startNegotiation(
  residentContext: ResidentContext,
  blockContext: BlockContext
): Promise<NegotiationResult> {
  log.divider();
  log.negotiation(`Starting negotiation for Unit ${residentContext.unitId}`);
  log.divider();

  // Create negotiation record in database
  const negotiation = await prisma.negotiation.create({
    data: {
      unitId: residentContext.unitId,
      status: 'pending',
      rounds: 0,
    },
  });

  log.negotiation(`Negotiation ID: ${negotiation.id}`);

  try {
    // Step 1: Resident Agent generates initial proposal
    log.divider();
    const residentResponse = await generateResidentProposal(residentContext);

    if (!residentResponse.proposal) {
      throw new Error('Resident Agent failed to generate proposal');
    }

    // Store resident's proposal
    await prisma.message.create({
      data: {
        negotiationId: negotiation.id,
        role: 'resident_agent',
        content: residentResponse.reasoning,
        proposal: JSON.stringify(residentResponse.proposal),
      },
    });

    let currentProposal = residentResponse.proposal;
    let round = 1;
    let finalStatus: 'approved' | 'denied' | 'accepted' | 'countered' = 'pending' as never;

    // Negotiation loop
    while (round <= MAX_ROUNDS) {
      log.divider();
      log.negotiation(`Round ${round}/${MAX_ROUNDS}`);

      // Step 2: Block Agent evaluates
      const blockResponse = round === 1
        ? await evaluateProposal(blockContext, residentContext.unitId, currentProposal)
        : await evaluateCounterProposal(
            blockContext,
            residentContext.unitId,
            currentProposal,
            currentProposal, // Previous block suggestion
            round
          );

      // Store block agent's response
      await prisma.message.create({
        data: {
          negotiationId: negotiation.id,
          role: 'block_agent',
          content: blockResponse.reasoning,
          proposal: blockResponse.counterProposal
            ? JSON.stringify(blockResponse.counterProposal)
            : null,
        },
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
        const residentCounterResponse = await respondToBlockAgent(
          residentContext,
          blockResponse.counterProposal,
          currentProposal,
          round
        );

        // Store resident's response
        await prisma.message.create({
          data: {
            negotiationId: negotiation.id,
            role: 'resident_agent',
            content: residentCounterResponse.reasoning,
            proposal: residentCounterResponse.proposal
              ? JSON.stringify(residentCounterResponse.proposal)
              : null,
          },
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
    await prisma.negotiation.update({
      where: { id: negotiation.id },
      data: {
        status: finalStatus,
        rounds: round,
      },
    });

    // Fetch all messages
    const messages = await prisma.message.findMany({
      where: { negotiationId: negotiation.id },
      orderBy: { createdAt: 'asc' },
    });

    log.divider();
    log.negotiation(`Negotiation COMPLETED: ${finalStatus.toUpperCase()} after ${round} round(s)`);
    log.divider();

    return {
      negotiationId: negotiation.id,
      status: finalStatus,
      rounds: round,
      finalProposal: currentProposal,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        proposal: m.proposal ?? undefined,
      })),
    };
  } catch (error) {
    log.error(`Negotiation failed: ${error}`);

    await prisma.negotiation.update({
      where: { id: negotiation.id },
      data: { status: 'denied' },
    });

    throw error;
  }
}

export async function getNegotiation(negotiationId: string) {
  const negotiation = await prisma.negotiation.findUnique({
    where: { id: negotiationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return negotiation;
}

export async function listNegotiations(unitId?: string) {
  const negotiations = await prisma.negotiation.findMany({
    where: unitId ? { unitId } : undefined,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return negotiations;
}
