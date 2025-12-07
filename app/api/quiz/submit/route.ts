import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const POST = async (request: NextRequest) => {
    try {
        const { quizId, answers }: { quizId: string; answers: { id: number; answer: string }[] } = await request.json();

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('sessionId')?.value;
        if (!sessionId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 400 });
        }

        const quiz = await prisma.quiz.findUnique({
            where: { quizId },
            select: { data: true },
        });

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        const quizData = quiz.data as { quiz: { id: number; correct_answer: string }[] };

        let correct = 0;
        const total = quizData.quiz.length;

        for (const ans of answers) {
            const question = quizData.quiz.find(q => q.id === ans.id);
            if (question && question.correct_answer === ans.answer) {
                correct++;
            }
        }

        const score = (correct / total) * 100;

        await prisma.quizAttempt.create({
            data: {
                quizId,
                sessionId,
                answers: answers,
                score,
            },
        });

        const showScore = score >= 60;

        return NextResponse.json({
            success: true,
            score: showScore ? score : undefined,
            showScore,
            correct,
            total,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Submit error:", error);
        return NextResponse.json({ error: error.message || "An internal error occurred" }, { status: 500 });
    }
};