# Technical Methodology: ChillPill

## Smart Cooling Coordination System for HDB Blocks

---

## 1. Executive Summary

ChillPill is a multi-agent AI system designed to address Singapore's urban heat island effect caused by cumulative air-conditioning usage in high-density housing. The system employs two AI agents—a Resident Agent and a Block Agent—that negotiate optimal cooling schedules, balancing individual comfort with collective sustainability.

---

## 2. Problem Statement

### 2.1 The Urban Heat Challenge
- Singapore's tropical climate drives high air-conditioning demand
- In HDB blocks, thousands of AC units operate independently
- Each unit discharges heat externally, creating a feedback loop
- Cumulative heat discharge raises ambient temperature, increasing cooling demand
- Current solutions focus on individual efficiency, ignoring collective impact

### 2.2 Limitations of Existing Approaches
| Approach | Limitation |
|----------|------------|
| Energy-efficient appliances | Individual optimization, no coordination |
| Smart thermostats | Household-level only, no block awareness |
| Time-of-use pricing | Blunt instrument, doesn't account for heat discharge |
| Building insulation | High cost, doesn't address collective behavior |

---

## 3. Proposed Solution

### 3.1 Multi-Agent Negotiation Framework

We propose a two-layer AI agent system where agents negotiate rather than enforce:

```
┌─────────────────────────────────────────────────────────────────┐
│                        HDB BLOCK LEVEL                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BLOCK AGENT                           │   │
│  │  • Monitors aggregate heat discharge                     │   │
│  │  • Evaluates collective impact                           │   │
│  │  • Suggests schedule adjustments                         │   │
│  │  • Coordinates peak load distribution                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▲                                  │
│                              │ Negotiation                      │
│                              ▼                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Resident │  │ Resident │  │ Resident │  │ Resident │  ...  │
│  │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  │ Agent N  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│      Unit 1       Unit 2       Unit 3       Unit N             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Innovation: Negotiation Loop

Unlike top-down control systems, our agents **negotiate**:

1. **Resident Agent** proposes an optimal schedule based on household needs
2. **Block Agent** evaluates collective impact and may counter-propose
3. **Resident Agent** can accept, reject, or counter-propose
4. Process continues for up to 3 rounds
5. Final outcome preserves household autonomy while aligning with sustainability goals

---

## 4. System Architecture

### 4.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React 19, TypeScript | User interface |
| Backend | Next.js API Routes | API endpoints |
| AI Engine | Vercel AI SDK, OpenAI GPT-4o-mini | Agent reasoning |
| Database | SQLite (In-memory for prototype) | Negotiation history |
| Styling | CSS Modules | Component styling |

### 4.2 Component Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── negotiate/           # Negotiation endpoint
│   │   └── negotiations/        # History endpoints
│   ├── dashboard/
│   │   ├── hdb/                 # Block representative view
│   │   └── resident/            # Household view
│   └── login/                   # Role selection
├── lib/
│   ├── agents/
│   │   ├── resident-agent.ts    # Resident AI logic
│   │   └── block-agent.ts       # Block AI logic
│   ├── negotiation.ts           # Orchestration engine
│   └── db.ts                    # Data persistence
```

---

## 5. Agent Design

### 5.1 Resident Agent

**Purpose**: Advocate for household comfort while being mindful of sustainability

**Inputs**:
- Household size
- Preferred temperature
- Occupancy patterns (when family is home)
- Current outdoor temperature
- Time of day

**System Prompt**:
```
You are a Resident AI Agent for a household in an HDB block. Your role is to:
1. ADVOCATE for your household's comfort
2. PROPOSE optimal cooling schedules based on household patterns
3. NEGOTIATE with the Block Agent when proposals are countered
4. BALANCE personal comfort with community responsibility

When proposing, provide:
- Temperature (18-28°C)
- Time range (e.g., "18:00-22:00")
- Reasoning based on household context
```

**Output Schema**:
```typescript
{
  action: 'propose' | 'accept' | 'counter' | 'reject',
  proposal: {
    temperature: number,
    startTime: string,
    endTime: string,
    reason: string
  },
  reasoning: string
}
```

### 5.2 Block Agent

**Purpose**: Coordinate cooling across the block for collective sustainability

**Inputs**:
- Block ID and total units
- Currently active AC units
- Block Heat Index (0-100 scale)
- Peak demand hours
- Average block temperature
- Individual unit proposals

**System Prompt**:
```
You are the HDB Block AI Agent responsible for coordinating cooling. Consider:
1. Peak demand hours (14:00-19:00 in Singapore)
2. Cumulative heat discharge from multiple units
3. Urban heat island effect mitigation
4. Block energy efficiency targets

Decision criteria:
- APPROVE if minimal negative impact
- COUNTER with alternatives if room for optimization
- DENY only if significant harm to block sustainability
```

**Output Schema**:
```typescript
{
  decision: 'approve' | 'counter' | 'deny',
  counterProposal?: {
    temperature: number,
    startTime: string,
    endTime: string,
    reason: string
  },
  reasoning: string,
  impactAssessment: {
    heatContribution: 'low' | 'medium' | 'high',
    peakLoadImpact: 'minimal' | 'moderate' | 'significant',
    recommendedAction: string
  }
}
```

---

## 6. Negotiation Algorithm

### 6.1 Flow Diagram

```
┌─────────────────┐
│  Resident sets  │
│  preferences    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Resident Agent  │
│ generates       │
│ proposal        │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Block Agent    │
│  evaluates      │◄─────────────────┐
└────────┬────────┘                  │
         ▼                           │
    ┌────────┐                       │
    │Decision│                       │
    └────┬───┘                       │
         │                           │
    ┌────┴────┬──────────┐          │
    ▼         ▼          ▼          │
┌───────┐ ┌───────┐ ┌────────┐      │
│APPROVE│ │COUNTER│ │ DENY   │      │
└───┬───┘ └───┬───┘ └────┬───┘      │
    │         │          │          │
    ▼         ▼          ▼          │
  Done    ┌───────┐    Done         │
          │Resident│                 │
          │responds│                 │
          └───┬───┘                  │
              │                      │
         ┌────┴────┬──────┐         │
         ▼         ▼      ▼         │
     ┌──────┐ ┌───────┐ ┌──────┐    │
     │ACCEPT│ │COUNTER│ │REJECT│    │
     └──┬───┘ └───┬───┘ └──┬───┘    │
        │         │        │        │
        ▼         │        │        │
      Done        │        │        │
                  ▼        ▼        │
              Round < 3? ──Yes──────┘
                  │
                  No
                  ▼
            Block Agent
            final decision
```

### 6.2 Negotiation Rules

1. **Maximum Rounds**: 3 rounds of negotiation
2. **Tie-breaker**: Block Agent decision is final after round 3
3. **Autonomy Preserved**: Residents can always reject (with sustainability score impact)
4. **Logging**: All negotiations are logged for transparency

### 6.3 Decision Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Heat Index | High | Current block heat level (0-100) |
| Peak Hours | High | Whether cooling overlaps 14:00-19:00 |
| Temperature Delta | Medium | Difference from ambient temperature |
| Active Units | Medium | How many units are currently cooling |
| Household Size | Low | Larger households get more flexibility |

---

## 7. Data Models

### 7.1 Negotiation Record

```typescript
interface Negotiation {
  id: string;
  unitId: string;
  status: 'pending' | 'approved' | 'countered' | 'denied' | 'accepted';
  rounds: number;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}
```

### 7.2 Message Record

```typescript
interface Message {
  id: string;
  negotiationId: string;
  role: 'resident_agent' | 'block_agent';
  content: string;
  proposal?: string; // JSON of CoolingProposal
  createdAt: Date;
}
```

### 7.3 Cooling Proposal

```typescript
interface CoolingProposal {
  temperature: number;    // 18-28°C
  startTime: string;      // "HH:MM" format
  endTime: string;        // "HH:MM" format
  reason: string;         // Justification
}
```

---

## 8. API Specification

### 8.1 Start Negotiation

```
POST /api/negotiate
Content-Type: application/json

Request:
{
  "unitId": "12-345",
  "preferredTemp": 23,
  "householdSize": 4,
  "outdoorTemp": 32
}

Response:
{
  "success": true,
  "data": {
    "negotiationId": "neg_xxx",
    "status": "approved" | "accepted" | "countered" | "denied",
    "rounds": 2,
    "finalProposal": {
      "temperature": 24,
      "startTime": "18:00",
      "endTime": "22:00"
    },
    "messages": [...]
  }
}
```

### 8.2 List Negotiations

```
GET /api/negotiations?unitId=12-345

Response:
{
  "success": true,
  "data": [...],
  "count": 5
}
```

---

## 9. User Interface Design

### 9.1 Design Philosophy

- **Retro Gaming Aesthetic**: Neon colors, pixel fonts, scanline effects
- **Two User Roles**: HDB Representative (block view) and Resident (household view)
- **Real-time Feedback**: Live negotiation status and history

### 9.2 Key Screens

| Screen | Purpose |
|--------|---------|
| Splash | Brand introduction, role selection entry |
| Login | Role selection (HDB Rep vs Resident) |
| HDB Dashboard | Block-wide monitoring, heat maps, negotiations queue |
| Resident Dashboard | Personal cooling control, AI suggestions, negotiation trigger |

---

## 10. Simulation Parameters

For the prototype, we simulate block conditions:

| Parameter | Range | Description |
|-----------|-------|-------------|
| Total Units | 248 | Fixed block size |
| Active Units | 80-180 | Randomly generated |
| Heat Index | 40-80 | Randomly generated (0-100 scale) |
| Peak Hours | 14:00-19:00 | Fixed Singapore peak demand |
| Outdoor Temp | 30-34°C | Simulated weather |

---

## 11. Evaluation Metrics

### 11.1 System Performance

- **Negotiation Success Rate**: % of negotiations reaching agreement
- **Average Rounds**: Mean number of negotiation rounds
- **Response Time**: Time to complete negotiation (10-30 seconds)

### 11.2 Sustainability Impact (Simulated)

- **Heat Discharge Reduction**: Estimated % reduction from coordination
- **Peak Load Smoothing**: Distribution of cooling across time
- **Energy Savings**: Projected savings from optimized schedules

---

## 12. Future Enhancements

### 12.1 Short-term
- Real weather API integration
- Persistent database (PostgreSQL/Supabase)
- Push notifications for negotiation requests

### 12.2 Medium-term
- Machine learning for occupancy prediction
- Integration with smart AC units
- Multi-block coordination

### 12.3 Long-term
- City-wide heat management network
- Carbon credit integration
- Predictive pre-cooling algorithms

---

## 13. Conclusion

ChillPill demonstrates a novel approach to urban heat management through multi-agent negotiation. By treating cooling as a collective decision rather than individual choices, we can reduce cumulative heat discharge while preserving household autonomy. The negotiation framework ensures that sustainability improvements come through cooperation rather than restriction.

---

## Appendix A: Environment Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local

# Run development server
npm run dev

# Access application
open http://localhost:3000
```

## Appendix B: Testing the Negotiation

```bash
# Trigger a negotiation via API
curl -X POST http://localhost:3000/api/negotiate \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": "12-345",
    "preferredTemp": 22,
    "householdSize": 4
  }'
```

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Project: ChillPill - Hackathon 2026*
