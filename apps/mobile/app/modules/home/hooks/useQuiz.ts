import { client } from "@/app/services";
import { useMutation } from "@tanstack/react-query";

const submitQuizResult = async (result: any) => {
  return client.post("quiz/submit", result);
};

const generateMoreQuestions = async (quizId: any, userPrompt: any) => {
  return client.post("quiz/continue-learning", {
    quizId: quizId,
    userPrompt: userPrompt || "More questions",
  });
};

const fetchExplanation = async (payload: {
  quizId: string;
  questionIndex: number;
  selectedAnswerIndex?: number;
  correctAnswerIndex?: number;
}) => {
  return client.post("quiz/explain-answer", payload);
};

const useQuiz = () => {
  const quizResultMutation = useMutation({
    mutationFn: (result: any) => submitQuizResult(result),
  });

  const moreQuestionsMutation = useMutation({
    mutationKey: ["moreQuestions"],
    mutationFn: ({ quizId, userPrompt }: { quizId: any; userPrompt: any }) =>
      generateMoreQuestions(quizId, userPrompt),
  });
  const explanationMutation = useMutation({
    mutationKey: ["explanation"],
    mutationFn: (payload: {
      quizId: string;
      questionIndex: number;
      correctAnswerIndex: number;
      selectedAnswerIndex: number;
    }) => fetchExplanation(payload),
  });

  return { quizResultMutation, moreQuestionsMutation, explanationMutation };
};

export default useQuiz;
