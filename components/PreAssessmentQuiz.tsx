'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const questions = [
  {
    id: 1,
    question: "رشته‌ی تحصیلی (کنکوری) شما کدام است؟",
    key: "field_of_study",
    options: ["ریاضی و فیزیک", "علوم تجربی", "علوم انسانی", "فنی و حرفه‌ای/کاردانش"],
  },
  {
    id: 2,
    question: "سطح آمادگی و تسلط فعلی خود را برای کنکور چگونه ارزیابی می‌کنید؟",
    key: "current_level",
    options: ["کم (تازه شروع کرده‌ام)", "متوسط (مطالعه‌ی منظمی دارم)", "خوب (مطالب را تا حد زیادی تمام کرده‌ام)", "عالی (آماده‌ی آزمون‌های جامع هستم)"],
  },
  {
    id: 3,
    question: "تمرکز اصلی شما برای قبولی در کدام دانشگاه است؟",
    key: "university_priority",
    options: ["دانشگاه‌های درجه ۱ و برتر (مانند شریف، تهران، امیرکبیر)", "دانشگاه‌های سراسری مناطق دیگر", "دانشگاه های سراسری شهر خودم", "اولویت با دانشگاه مهم نیست، رشته مهم است"],
  },
  {
    id: 4,
    question: "اولویت اصلی شما در انتخاب رشته چیست؟",
    key: "major_priority",
    options: ["بازار کار و درآمد آینده", "علاقه‌ی شخصی و استعداد", "اعتبار اجتماعی رشته (پرستیژ)", "قبولی در دانشگاه‌های خوب، هر رشته‌ای که باشد"],
  },
  {
    id: 5,
    question: "برای تولید آزمون، تمایل دارید تمرکز سوالات بیشتر روی کدام نوع منابع باشد؟",
    key: "resource_focus",
    options: ["کتاب‌های درسی و نکات اصلی", "تست‌های کنکور سال‌های قبل", "تست‌های تألیفی و پیشرفته", "ترکیبی از همه"],
  },
  {
    id: 6,
    question: "به طور متوسط، چند ساعت در روز به مطالعه و تست‌زنی اختصاص می‌دهید؟",
    key: "study_hours",
    options: ["کمتر از ۴ ساعت", "۴ تا ۶ ساعت", "۶ تا ۸ ساعت", "بیشتر از ۸ ساعت"],
  },
  {
    id: 8,
    question: "تعداد سوالات آزمون تولیدی توسط هوش مصنوعی را در هر مرحله چند عدد ترجیح می‌دهید؟",
    key: "quiz_length_preference",
    options: ["۵ سوال (سریع)", "۱۰ سوال (متوسط)", "۱۵ سوال (کامل)", "۲۰ سوال یا بیشتر (جامع)"],
  },
];

export default function PreAssessmentQuiz() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const selectOption = (option: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option });
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const finalAnswers = questions.map((q, index) => ({
      question: q.question, 
      key: q.key,
      answer: selectedAnswers[index],
    }));

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalAnswers),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطا در تولید آزمون توسط سرور.');
      }

      localStorage.setItem('exam-id' , data.quizId);
      router.push(`/exam-section`);

    } catch (err: any) {
      console.error('Quiz Submission Error:', err);
      setError(err.message || 'خطای ناشناخته در ارسال اطلاعات. لطفاً دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (!selectedAnswers[currentQuestionIndex]) return;
    if (currentQuestionIndex === questions.length - 1) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };


  if (loading) {
    return (
      <div className="w-full min-h-screen font-modamBold bg-linear-to-b from-blue-100 to-purple-100 flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold text-gray-800">
            در حال ساخت آزمون شخصی‌سازی شده...
          </h2>
          <p className="text-gray-500 mt-1">
            لطفاً کمی صبر کنید، هوش مصنوعی در حال تحلیل پاسخ‌های شماست.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-modamBold bg-linear-to-b from-blue-100 to-purple-100 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute top-0 left-0 h-2 bg-linear-to-r from-green-400 to-green-600"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2"
      >
        <Zap className="w-4 h-4 text-blue-500" />
        سوال {currentQuestionIndex + 1} از {questions.length}
      </motion.div>

      <motion.h2
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6"
      >
        {currentQuestion.question}
      </motion.h2>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 bg-red-100 p-3 rounded-xl mb-4 text-center w-full max-w-md"
        >
          {error}
        </motion.div>
      )}

      <motion.ul className="flex flex-col gap-4 w-full max-w-md">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === option;
          return (
            <motion.li
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectOption(option)}
              className={`w-full p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 text-gray-700 font-medium bg-white
                   border-gray-200 hover:bg-white hover:shadow-md ${isSelected ? 'border-green-500 bg-green-50 shadow-md' : 'shadow-sm'}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isSelected && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      <motion.div className="flex justify-between items-center mt-8 w-full max-w-md">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={nextQuestion}
          disabled={!selectedAnswers[currentQuestionIndex] || loading}
          className="px-8 py-3 rounded-2xl bg-linear-to-r from-green-500 to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-green-600 hover:to-teal-600 shadow-md transition-all duration-200 font-semibold flex items-center gap-2"
        >
          {currentQuestionIndex === questions.length - 1 ? "پایان و ساخت آزمون" : "بعدی"}
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0 || loading}
          className="px-6 py-3 rounded-2xl bg-green-100 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-200 shadow-md transition-all duration-200 font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          قبلی
        </motion.button>
      </motion.div>
    </div>
  );
}