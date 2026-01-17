import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, formDataClient } from "../../../services";

interface GenerateFlashcardsData {
  text: string;
  category: string;
  count: number;
  difficulty: string;
}

interface GenerateFlashcardsResponse {
  message: string;
  flashcards: any[];
  deck: any;
  count: number;
}


export const useFlashcardAPI = () => {
  const queryClient = useQueryClient();
  const generateFlashcardsMutation = useMutation({
    mutationFn: async (
      data: GenerateFlashcardsData
    ): Promise<GenerateFlashcardsResponse> => {
      const response = await client.post("flashcards/generate", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const generateFlashcardsFromFileMutation = useMutation({
    mutationFn: async (
      formData: FormData
    ): Promise<GenerateFlashcardsResponse> => {
      const response = await formDataClient.post(
        "flashcards/generate-from-file",
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const generateFlashcardsFromQuizMutation = useMutation({
    mutationFn: async (data: {
      quiz: any;
    }): Promise<GenerateFlashcardsResponse> => {
      const response = await client.post("flashcards/generate-from-quiz", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });


  const createDeckMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      category?: string;
      difficulty?: string;
      color?: string;
    }) => {
      const response = await client.post("flashcards/decks", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const getDeckFlashcards = async (deckId: string) => {
    const response = await client.get(`flashcards/decks/${deckId}/flashcards`);
    return response.data;
  };

  const generateFlashcards = async (data: GenerateFlashcardsData) => {
    return generateFlashcardsMutation.mutateAsync(data);
  };

  const generateFlashcardsFromFile = async (
    file: any,
    topic: string,
    difficulty: string,
    count: number
  ) => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type || "application/octet-stream",
      name: file.name || "file",
    } as any);
    formData.append("topic", topic || "");
    formData.append("difficulty", difficulty || "medium");
    formData.append("numberOfQuestions", count.toString());
    return generateFlashcardsFromFileMutation.mutateAsync(formData);
  };

  const generateFlashcardsFromQuiz = async (quiz: any) => {
    return generateFlashcardsFromQuizMutation.mutateAsync({ quiz });
  };

  const createDeck = async (data: {
    name: string;
    description?: string;
    category?: string;
    difficulty?: string;
    color?: string;
  }) => {
    return createDeckMutation.mutateAsync(data);
  };

  return {
    queryClient,

    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
    generateFlashcardsFromQuizMutation,
    createDeckMutation,

    generateFlashcards,
    generateFlashcardsFromFile,
    generateFlashcardsFromQuiz,
    createDeck,
    getDeckFlashcards,
  };
};
