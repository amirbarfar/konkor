'use client'

import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, Trophy, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string; 
}

interface QuizResponse {
    quiz: QuizQuestion[];
    title: string;
}

export default function ExamSection() {
   const router = useRouter();
   const [quizId, setQuizId] = useState<string | null>(null);
   useEffect(() => {
     setQuizId(localStorage.getItem('exam-id'));
   }, []);
 
   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState("آزمون شبیه‌ساز کنکور");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);


  const fetchQuizData = useCallback(async () => {
    if (!quizId) {
      setError("شناسه‌ی آزمون (quizId) در آدرس یافت نشد.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/quiz?quizId=${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بارگذاری آزمون.');
      }

      const data: QuizResponse = await response.json();
      setQuestions(data.quiz);
      setQuizTitle(data.title || "آزمون شبیه‌ساز کنکور");
      setLoading(false);
      setAnswers({});
      setIndex(0);

    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(`خطا: ${err.message}`);
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);


  useEffect(() => {
    if (questions.length > 0 && index === questions.length && !submitted) {
      submitAnswers();
    }
  }, [index, questions.length, submitted]);

  const submitAnswers = async () => {
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: Object.entries(answers).map(([id, answer]) => ({ id: parseInt(id), answer }))
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setShowScore(data.showScore);
        if (data.showScore) {
          setFinalScore(data.score);
        }
        setShowResults(true);
      } else {
        console.error('Submit error:', data.error);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Submit fetch error:', err);
      setShowResults(true);
    }
  };

  const generateAdaptiveQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/session/answers');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch initial answers');
      }
      const data = await response.json();
      const userAnswers = data.answers;

      const levels = ['کم (تازه شروع کرده‌ام)', 'متوسط (مطالعه‌ی منظمی دارم)', 'خوب (مطالب را تا حد زیادی تمام کرده‌ام)', 'عالی (آماده‌ی آزمون‌های جامع هستم)'];
      const levelQuestion = userAnswers.find((a: any) => a.key === 'current_level');
      const currentLevelAnswer = levelQuestion?.answer;
      const levelIndex = levels.indexOf(currentLevelAnswer);

      if (levelIndex !== -1) {
        const score = finalScore ?? percentage;
        let newIndex = levelIndex;
        if (score < 40 && levelIndex > 0) {
          newIndex = levelIndex - 1;
        } else if (score > 80 && levelIndex < levels.length - 1) {
          newIndex = levelIndex + 1;
        }
        levelQuestion.answer = levels[newIndex];
      }

      const genResponse = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userAnswers),
      });

      const genData = await genResponse.json();
      if (!genResponse.ok) {
        throw new Error(genData.error);
      }

      setQuizId(genData.quizId);
      localStorage.setItem('exam-id', genData.quizId);

      // Reset state
      setQuestions([]);
      setAnswers({});
      setIndex(0);
      setShowResults(false);
      setSubmitted(false);
      setShowScore(false);
      setFinalScore(null);

      // Fetch new quiz
      await fetchQuizData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mr-3 text-lg text-gray-700">در حال بارگذاری آزمون...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">خطا در بارگذاری</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-6">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
             <h2 className="text-xl font-bold text-yellow-800 mb-2">آزمونی یافت نشد</h2>
             <p className="text-gray-700">متأسفانه آزمونی برای این شناسه تولید نشده است.</p>
          </div>
        </div>
     );
  }


  const current = questions[index];
  const selected = answers[index];
  
  const progress = ((index + 1) / questions.length) * 100; 

  const correctCount = Object.keys(answers).filter((key) => {
    const qIndex = parseInt(key);
    return answers[qIndex] === questions[qIndex].correct_answer;
  }).length;
  
  const wrongCount = Object.keys(answers).length - correctCount;
  const unansweredCount = questions.length - Object.keys(answers).length;
  
  const percentage = Math.round((correctCount / questions.length) * 100); 

  const choose = (op: string) => {
    setAnswers({ ...answers, [index]: op });
  };

  const goNext = () => {
    if (!selected) return; 

    if (index < questions.length) {
      setIndex(index + 1);
    }
  };

  const resetQuiz = () => {
    setIndex(0);
    setAnswers({});
    setShowResults(false);
    setSubmitted(false);
    fetchQuizData();
  }

  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center" style={{ fontFamily: "modamRegular, sans-serif" }}>
      <div className="max-w-4xl w-full">
        {index < questions.length && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {quizTitle}
              </h1>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <motion.div
                  className="bg-blue-600 h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-center text-gray-600 font-medium">
                سوال {index + 1} از {questions.length}
              </p>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-2xl shadow-inner">
              <h2 className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                {current.question_text}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {current.options.map((op, i) => {
                const isSelected = selected === op;
                return (
                  <motion.button
                    key={i}
                    onClick={() => choose(op)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-xl border text-center font-medium text-xl transition-all
                      ${isSelected
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white hover:bg-gray-100 border-gray-300"}`}
                  >
                    {op}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                onClick={goNext}
                disabled={!selected}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-lg"
              >
                <ChevronRight className="w-5 h-5" />
                {index === questions.length - 1 ? "پایان آزمون" : "بعدی"}
              </button>

              <button
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
                className="flex items-center gap-2 px-8 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-lg"
              >
                قبلی
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-12 max-w-2xl w-full text-center shadow-2xl"
                style={{ fontFamily: "modamRegular, sans-serif" }}
              >
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-6">نتایج {quizTitle}</h2>
                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-center gap-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="text-xl">تعداد پاسخ‌های درست: {correctCount}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <span className="text-xl">تعداد پاسخ‌های غلط: {wrongCount}</span>
                  </div>
                   <div className="flex items-center justify-center gap-4">
                    <span className="text-xl">بدون پاسخ: {unansweredCount}</span>
                  </div>
                  {showScore ? (
                    <div className="text-2xl font-semibold text-blue-600 border-t pt-4 mt-4">
                      درصد موفقیت: {finalScore ?? percentage}%
                    </div>
                  ) : (
                    <div className="text-xl font-semibold text-gray-600 border-t pt-4 mt-4">
                      پاسخ‌های شما ذخیره شد. برای پیشرفت، آزمون‌های بیشتری شرکت کنید.
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg"
                  >
                    آزمون مجدد
                  </button>
                  <button
                    onClick={generateAdaptiveQuiz}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg"
                  >
                    آزمون جدید تطبیقی
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}