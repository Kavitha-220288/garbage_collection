import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../../../api/src/services/db-store';
import { SubmitFeedbackInputSchema } from '@smartwaste360/contracts';
import { connectToDatabase } from '@/lib/mongodb';
import { FeedbackModel } from '@/lib/models';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = SubmitFeedbackInputSchema.parse(body);

    const feedback = dbStore.submitFeedback(id, validated.rating, validated.comment);

    // Save to MongoDB if connected
    try {
      await connectToDatabase();
      await FeedbackModel.create(feedback);
    } catch (dbErr: any) {
      console.warn('⚠️ MongoDB feedback insert skipped:', dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      feedback,
      message: feedback.reopenedIncident
        ? `Thank you for rating. Your low rating (${validated.rating}/5) automatically reopened Incident #${id} for supervisor review.`
        : `Thank you for rating your service experience (${validated.rating}/5 stars).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit feedback' },
      { status: 400 }
    );
  }
}

