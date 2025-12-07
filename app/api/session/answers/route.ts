import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const GET = async (request: NextRequest) => {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('sessionId')?.value;
        if (!sessionId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 400 });
        }

        const initialAnswer = await prisma.initialAnswer.findUnique({
            where: { sessionId },
            select: { answers: true },
        });

        if (!initialAnswer) {
            return NextResponse.json({ error: 'Initial answers not found' }, { status: 404 });
        }

        return NextResponse.json({ answers: initialAnswer.answers }, { status: 200 });

    } catch (error: any) {
        console.error("Session answers error:", error);
        return NextResponse.json({ error: error.message || "An internal error occurred" }, { status: 500 });
    }
};