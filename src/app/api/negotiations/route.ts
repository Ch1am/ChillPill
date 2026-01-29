import { NextRequest, NextResponse } from 'next/server';
import { listNegotiations } from '@/lib/negotiation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId') || undefined;

    const negotiations = await listNegotiations(unitId);

    return NextResponse.json({
      success: true,
      data: negotiations,
      count: negotiations.length,
    });
  } catch (error) {
    console.error('Error listing negotiations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
