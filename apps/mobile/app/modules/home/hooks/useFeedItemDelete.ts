import { client } from "@/app/services";
import { useMutation } from "@tanstack/react-query";

export const useDeleteQuiz = () => {
  return useMutation({
    mutationFn: async (quizId: string) => {
      return await client.delete(`quiz/${quizId}`);
    },
    onError: (error: any) => {
      console.error(
        "Error deleting quiz:",
        error?.response?.data || error?.message
      );
    },
  });
};

export const useDeleteDeck = () => {
  return useMutation({
    mutationFn: async (deckId: string) => {
      return await client.delete(`flashcards/decks/${deckId}`);
    },
    onError: (error: any) => {
      console.error(
        "Error deleting deck:",
        error?.response?.data || error?.message
      );
    },
  });
};
