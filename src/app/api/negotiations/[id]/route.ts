import { NextRequest, NextResponse } from 'next/server';
import { getNegotiation } from '@/lib/negotiation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const negotiation = await getNegotiation(id);

    if (!negotiation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Negotiation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: negotiation,
    });
  } catch (error) {
    console.error('Error fetching negotiation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
