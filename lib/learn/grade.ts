type GradedQuestion = { id: string; options: { id: string; isCorrect: boolean }[] };

/** คะแนนเป็นเปอร์เซ็นต์ (ปัดเศษ) answers = { questionId: optionId } ข้อที่ไม่ตอบนับว่าผิด */
export function gradeQuiz(questions: GradedQuestion[], answers: Record<string, string>): number {
  if (!questions.length) return 0;
  const correct = questions.filter((q) => q.options.some((o) => o.isCorrect && o.id === answers[q.id])).length;
  return Math.round((correct * 100) / questions.length);
}
