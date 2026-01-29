import { NextRequest, NextResponse } from 'next/server';
import { startNegotiation } from '@/lib/negotiation';
import { ResidentContext } from '@/lib/agents/resident-agent';
import { BlockContext } from '@/lib/agents/block-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract resident context from request or use defaults
    const residentContext: ResidentContext = {
      unitId: body.unitId || '12-345',
      householdSize: body.householdSize || 3,
      preferredTemp: body.preferredTemp || 24,
      currentOutdoorTemp: body.outdoorTemp || 32,
      timeOfDay: body.timeOfDay || new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      occupancyPattern: body.occupancyPattern || 'Family returns home around 18:00, children do homework, dinner at 19:00',
    };

    // Block context - simulated data for the HDB block
    const blockContext: BlockContext = {
      blockId: body.blockId || 'BLK-123A',
      totalUnits: 248,
      activeUnits: Math.floor(Math.random() * 100) + 80, // Random 80-180 active units
      currentHeatIndex: Math.floor(Math.random() * 40) + 40, // Random 40-80 heat index
      peakHours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      avgBlockTemp: 24.5,
      outdoorTemp: residentContext.currentOutdoorTemp,
    };

    console.log('\n\x1b[44m\x1b[37m ═══ NEW NEGOTIATION REQUEST ═══ \x1b[0m\n');

    const result = await startNegotiation(residentContext, blockContext);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Negotiation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
