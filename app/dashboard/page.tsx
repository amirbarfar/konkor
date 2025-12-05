'use client'

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImprovedQuizPage() {
  const questions = [
    {
      q: "کدام گزینه صحیح است؟",
      options: ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
      correct: "گزینه ۱",
    },
    {
      q: "جمع ۱۲ و ۸ چند می‌شود؟",
      options: ["۱۰", "۱۸", "۲۰", "۲۲"],
      correct: "۲۰",
    },
    {
      q: "بهترین تعریف برای تابع چیست؟",
      options: ["یک نگاشت", "یک عدد", "یک معادله", "هیچکدام"],
      correct: "یک نگاشت",
    },
  ];

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (index === questions.length) {
      setShowResults(true);
    }
  }, [index]);

  const current = questions[index];
  const selected = answers[index];
  const progress = ((index + 1) / questions.length) * 100;

  const correctCount = answers.filter((ans, i) => ans === questions[i].correct).length;
  const wrongCount = questions.length - correctCount;
  const percentage = Math.round((correctCount / questions.length) * 100);

  const choose = (op: string) => {
    const newAns = [...answers];
    newAns[index] = op;
    setAnswers(newAns);
  };

  const goNext = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else if (index === questions.length - 1) {
      setIndex(questions.length);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center" style={{ fontFamily: "modamRegular, sans-serif" }}>
      <div className="max-w-4xl w-full">
        {index < questions.length && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                آزمون شبیه‌ساز کنکور
              </h1>
            </div>

            {/* Progress */}
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

            {/* Question */}
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl shadow-inner">
              <h2 className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                {current.q}
              </h2>
            </div>

            {/* Options */}
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

            {/* Navigation */}
            <div className="flex justify-between">
              <button
              onClick={goNext}
              disabled={index === questions.length - 1 && !selected}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-lg"
              >
              <ChevronRight className="w-5 h-5" />
              {index === questions.length - 1 ? "پایان" : "بعدی"}
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
                <h2 className="text-3xl font-bold text-gray-800 mb-6">نتایج آزمون کنکور</h2>
                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-center gap-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="text-xl">درست: {Math.round((correctCount / questions.length) * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <span className="text-xl">غلط: {Math.round((wrongCount / questions.length) * 100)}%</span>
                  </div>
                  <div className="text-2xl font-semibold text-blue-600">
                    درصد موفقیت: {percentage}%
                  </div>
                </div>
                <button
                  onClick={() => { setIndex(0); setAnswers(Array(questions.length).fill(null)); setShowResults(false); }}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg"
                >
                  آزمون مجدد
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
