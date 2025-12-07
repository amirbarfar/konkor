import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

interface UserAnswer {
    question: string;
    key: string;
    answer: string;
}

export const GET = async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const quizId = searchParams.get('quizId');

        if (!quizId) {
            return NextResponse.json({ error: 'Quiz ID is missing.' }, { status: 400 });
        }

        const quizData = await prisma.quiz.findUnique({
            where: {
                quizId: quizId,
            },
            select: {
                data: true,
            },
        });

        if (!quizData) {
            return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
        }

        const data = quizData.data as any;

        return NextResponse.json({ quiz: data.quiz, title: data.title }, { status: 200 });

    } catch (error: any) {
        console.error("API GET ERROR:", error);
        return NextResponse.json({ error: error.message || "An internal error occurred" }, { status: 500 });
    }
};

export const POST = async (request: NextRequest) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const MODEL = 'mistralai/mistral-7b-instruct:free'; 

    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: 'AI API Key is missing.' }, { status: 503 });
    }

    try {
        const userAnswers: UserAnswer[] = await request.json();
        
        if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or empty array of user answers.' },
                { status: 400 }
            );
        }
        
        const field = userAnswers.find(a => a.key === 'field_of_study')?.answer;
        let level = userAnswers.find(a => a.key === 'current_level')?.answer;
        const length = userAnswers.find(a => a.key === 'quiz_length_preference')?.answer.split(' ')[0] || '5';

        const cookieStore = await cookies();
        let sessionId = cookieStore.get('sessionId')?.value;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
        }

        if (sessionId) {
            const existing = await prisma.initialAnswer.findUnique({
                where: { sessionId }
            });
            if (!existing) {
                await prisma.initialAnswer.create({
                    data: {
                        sessionId,
                        answers: userAnswers as any
                    }
                });
            }
        }

        if (sessionId && field && level) {
            const levels = ['مبتدی', 'متوسط', 'پیشرفته'];
            const currentIndex = levels.indexOf(level);
            if (currentIndex !== -1) {
                const previousAttempts = await prisma.quizAttempt.findMany({
                    where: {
                        sessionId,
                        quiz: { fieldOfStudy: field }
                    },
                    select: { score: true },
                });
                if (previousAttempts.length > 0) {
                    const avgScore = previousAttempts.reduce((sum, a) => sum + a.score, 0) / previousAttempts.length;
                    if (avgScore < 40 && currentIndex > 0) {
                        level = levels[currentIndex - 1];
                    } else if (avgScore > 80 && currentIndex < levels.length - 1) {
                        level = levels[currentIndex + 1];
                    }
                }
            }
        }

        const promptContent = `
        ${length} سوال تستی در مورد دروس ${field} با سطح آمادگی ${level} بساز. خروجی **فقط** یک JSON باشد: {"title": "...", "quiz": [{"id": عدد, "question_text": رشته, "options": [رشته], "correct_answer": رشته}]}.
        `;

        const controller = new AbortController();
        const signal = controller.signal;
        setTimeout(() => controller.abort(), 30000);

        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            signal: signal,
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: "شما یک تولید کننده آزمون هوشمند هستید. خروجی شما باید منحصراً یک شیء JSON با کلیدهای 'title' و 'quiz' باشد. عنوان و سوالات باید به زبان فارسی باشند. خروجی باید دقیقاً به فرمت JSON باشد و هیچ متن اضافی نداشته باشد."
                    },
                    { role: "user", content: promptContent }
                ],
                max_tokens: 4000,
                response_format: { type: "json_object" }
            })
        });

        if (!apiResponse.ok) {
            if (apiResponse.status === 401) {
                return NextResponse.json({ error: "Invalid API key. Please check your OpenRouter API key." }, { status: 503 });
            }
            if (apiResponse.status === 402) {
                return NextResponse.json({ error: "Quota exceeded or payment required for OpenRouter API." }, { status: 503 });
            }
            if (apiResponse.status === 429) {
                return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
            }
            return NextResponse.json({ error: `OpenRouter API error: ${apiResponse.status} ${apiResponse.statusText}` }, { status: 500 });
        }

        const data = await apiResponse.json();
        const raw = data?.choices?.[0]?.message?.content;

        if (!raw) {
            return NextResponse.json(
                { error: "Model did not return content", data },
                { status: 500 }
            );
        }

        const cleaned = raw.replace(/```json|```/g, "").trim();

        let quizData;
        try {
            quizData = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Failed to parse JSON:", cleaned);
            return NextResponse.json(
                { error: "Invalid JSON returned by AI", raw: raw, cleaned: cleaned },
                { status: 500 }
            );
        }

        const quizTitle = quizData.title;
        const quizContent = quizData.quiz;

        if (!quizTitle || !Array.isArray(quizContent)) {
            return NextResponse.json({ error: "Invalid JSON format returned by AI. Missing title or quiz array." }, { status: 500 });
        }

        const savedQuiz = await prisma.quiz.create({
            data: {
                fieldOfStudy: field,
                data: { title: quizTitle, quiz: quizContent }, 
            },
        });

        const response = NextResponse.json({
            quiz: quizContent,
            quizId: savedQuiz.quizId,
            title: quizTitle
        }, { status: 200 });

        if (!cookieStore.get('sessionId')) {
            response.cookies.set('sessionId', sessionId!, { httpOnly: true, maxAge: 60*60*24*30 }); // 30 days
        }

        return response;

    } catch (error: any) {
        console.error("API POST ERROR:", error);
        if (error.name === 'AbortError') {
            return NextResponse.json({ error: "Request to AI service timed out. Please try again." }, { status: 504 });
        }
        return NextResponse.json({ error: error.message || "An internal error occurred" }, { status: 500 });
    }
};