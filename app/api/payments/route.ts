import { NextRequest, NextResponse } from 'next/server';

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const YOCO_CHECKOUTS_API = 'https://payments.yoco.com/api/checkouts';

const getBaseUrl = (request: NextRequest): string => {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, firstName, lastName, bookingData } = body;

    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: amount or email' },
        { status: 400 }
      );
    }

    if (!YOCO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment configuration missing secret key' },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(request);

    const checkoutResponse = await fetch(YOCO_CHECKOUTS_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'ZAR',
        successUrl: `${baseUrl}/book-now?payment=success`,
        cancelUrl: `${baseUrl}/book-now?payment=cancelled`,
        failureUrl: `${baseUrl}/book-now?payment=failed`,
        metadata: {
          email,
          firstName,
          lastName,
          bookingReference: bookingData?.bookingReference || '',
        },
      }),
    });

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error('Yoco checkout create failed:', {
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        data: checkoutData,
      });

      return NextResponse.json(
        {
          error: checkoutData?.message || checkoutData?.displayMessage || 'Failed to create checkout',
          details: checkoutData,
        },
        { status: checkoutResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutId: checkoutData.id,
      redirectUrl: checkoutData.redirectUrl,
      status: checkoutData.status,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const checkoutId = request.nextUrl.searchParams.get('checkoutId');

    if (!checkoutId) {
      return NextResponse.json(
        { error: 'Missing required query param: checkoutId' },
        { status: 400 }
      );
    }

    if (!YOCO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment configuration missing secret key' },
        { status: 500 }
      );
    }

    const verifyResponse = await fetch(`${YOCO_CHECKOUTS_API}/${checkoutId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return NextResponse.json(
        {
          error: verifyData?.message || verifyData?.displayMessage || 'Failed to verify checkout',
          details: verifyData,
        },
        { status: verifyResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutId: verifyData.id,
      status: verifyData.status,
      paymentId: verifyData.paymentId || null,
      amount: verifyData.amount,
      processingMode: verifyData.processingMode,
      metadata: verifyData.metadata || null,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
