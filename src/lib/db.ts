// In-memory storage for hackathon demo
// Prisma 7 adapter issues - using simple in-memory store instead

export interface Negotiation {
  id: string;
  unitId: string;
  status: string;
  rounds: number;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  negotiationId: string;
  role: string;
  content: string;
  proposal: string | null;
  createdAt: Date;
}

// In-memory store
const negotiations: Map<string, Negotiation> = new Map();
let messageIdCounter = 0;

function generateId(): string {
  return `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId(): string {
  return `msg_${++messageIdCounter}`;
}

// Prisma-like interface for compatibility
export const prisma = {
  negotiation: {
    create: async (args: { data: { unitId: string; status: string; rounds?: number } }) => {
      const id = generateId();
      const now = new Date();
      const negotiation: Negotiation = {
        id,
        unitId: args.data.unitId,
        status: args.data.status,
        rounds: args.data.rounds || 0,
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      negotiations.set(id, negotiation);
      console.log('[DB] Created negotiation:', id);
      return negotiation;
    },
    
    update: async (args: { where: { id: string }; data: Partial<Negotiation> }) => {
      const negotiation = negotiations.get(args.where.id);
      if (!negotiation) throw new Error('Negotiation not found');
      
      Object.assign(negotiation, args.data, { updatedAt: new Date() });
      console.log('[DB] Updated negotiation:', args.where.id, args.data);
      return negotiation;
    },
    
    findUnique: async (args: { where: { id: string }; include?: { messages?: { orderBy?: { createdAt: string } } } }) => {
      const negotiation = negotiations.get(args.where.id);
      return negotiation || null;
    },
    
    findMany: async (args?: { where?: { unitId?: string }; include?: { messages?: { orderBy?: { createdAt: string } } }; orderBy?: { createdAt: string } }) => {
      let results = Array.from(negotiations.values());
      
      if (args?.where?.unitId) {
        results = results.filter(n => n.unitId === args.where!.unitId);
      }
      
      // Sort by createdAt descending
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return results;
    },
  },
  
  message: {
    create: async (args: { data: { negotiationId: string; role: string; content: string; proposal?: string | null } }) => {
      const negotiation = negotiations.get(args.data.negotiationId);
      if (!negotiation) throw new Error('Negotiation not found');
      
      const message: Message = {
        id: generateMessageId(),
        negotiationId: args.data.negotiationId,
        role: args.data.role,
        content: args.data.content,
        proposal: args.data.proposal || null,
        createdAt: new Date(),
      };
      
      negotiation.messages.push(message);
      console.log('[DB] Created message:', message.role);
      return message;
    },
    
    findMany: async (args: { where: { negotiationId: string }; orderBy?: { createdAt: string } }) => {
      const negotiation = negotiations.get(args.where.negotiationId);
      if (!negotiation) return [];
      return [...negotiation.messages];
    },
  },
};
