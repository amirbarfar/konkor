'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PreAssessmentQuiz() {
  const questions = [
    { question: "پایتخت ایران کجاست؟", options: ["تهران", "مشهد", "اصفهان", "شیراز"], answer: "تهران" },
    { question: "سیاره سرخ کدام است؟", options: ["زمین", "مریخ", "زحل", "مشتری"], answer: "مریخ" },
    { question: "بزرگ‌ترین سیاره منظومه شمسی کدام است؟", options: ["زمین", "مریخ", "مشتری", "زحل"], answer: "مشتری" },
    { question: "کدام سیاره حلقه دارد؟", options: ["زمین", "مریخ", "مشتری", "زحل"], answer: "زحل" },
  ];

  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentQuestionIndex];


  const selectOption = (option: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option });
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const goToNextPage = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    goToNextPage()
  }, [currentQuestionIndex])
  


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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6"
      >
        {currentQuestion.question}
      </motion.h2>

      {/* Options */}
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

      {/* Navigation Buttons */}
      <motion.div className="flex justify-between items-center mt-8 w-full max-w-md">
        <motion.button
          whileHover={{ scale: selectedAnswers[currentQuestionIndex] ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextQuestion}
          disabled={!selectedAnswers[currentQuestionIndex]}
          className="px-8 py-3 rounded-2xl bg-linear-to-r from-green-500 to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-green-600 hover:to-teal-600 shadow-md transition-all duration-200 font-semibold flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4" />
          {currentQuestionIndex === questions.length - 1 ? "پایان" : "بعدی"}
        </motion.button>

        <motion.button
          whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-2xl bg-green-100 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-200 shadow-md transition-all duration-200 font-medium flex items-center gap-2"
        >
          قبلی
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
