import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../../../services";

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

interface GetDecksResponse {
  decks: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface StudyStatistics {
  totalCards: number;
  cardsDue: number;
  cardsLearning: number;
  cardsReviewing: number;
  cardsMastered: number;
  averageAccuracy: number;
  totalStudyTime: number;
}

interface GetStudyProgressResponse {
  statistics: StudyStatistics;
}

export const useFlashcardAPI = () => {
  const queryClient = useQueryClient();

  // Generate flashcards from text
  const generateFlashcardsMutation = useMutation({
    mutationFn: async (
      data: GenerateFlashcardsData
    ): Promise<GenerateFlashcardsResponse> => {
      const response = await client.post("flashcards/generate", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch decks and progress
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
    },
  });

  // Generate flashcards from file
  const generateFlashcardsFromFileMutation = useMutation({
    mutationFn: async (
      formData: FormData
    ): Promise<GenerateFlashcardsResponse> => {
      const response = await client.post(
        "flashcards/generate-from-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
    },
  });

  // Generate flashcards from quiz
  const generateFlashcardsFromQuizMutation = useMutation({
    mutationFn: async (data: {
      quiz: any;
    }): Promise<GenerateFlashcardsResponse> => {
      const response = await client.post("flashcards/generate-from-quiz", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
    },
  });

  // Get user decks
  const getUserDecks = async (): Promise<GetDecksResponse> => {
    const response = await client.get("flashcards/decks");
    return response.data;
  };

  // Get user decks query
  const useUserDecks = () => {
    return useQuery({
      queryKey: ["flashcard-decks"],
      queryFn: getUserDecks,
      staleTime: 60_000, // cache for 60s
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });
  };

  // Create deck
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
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });

  // Get deck flashcards
  const getDeckFlashcards = async (deckId: string) => {
    const response = await client.get(`flashcards/decks/${deckId}/flashcards`);
    return response.data;
  };

  // Get cards for review
  const getCardsForReview = async (deckId?: string) => {
    const params = deckId ? { deckId } : {};
    const response = await client.get("flashcards/review", {
      params,
    });
    return response.data;
  };

  // Submit review
  const submitReviewMutation = useMutation({
    mutationFn: async (data: {
      flashcardId: string;
      response: "again" | "hard" | "good" | "easy";
      responseTime: number;
      studyMode?: string;
    }) => {
      const response = await client.post(
        `flashcards/review/${data.flashcardId}`,
        {
          response: data.response,
          responseTime: data.responseTime,
          studyMode: data.studyMode || "spaced_repetition",
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
    },
  });

  // Get study progress
  const getStudyProgress = async (): Promise<GetStudyProgressResponse> => {
    const response = await client.get("flashcards/progress");
    return response.data;
  };

  // Get study progress query
  const useStudyProgress = () => {
    return useQuery({
      queryKey: ["flashcard-progress"],
      queryFn: getStudyProgress,
      staleTime: 30_000, // progress can refresh more often
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });
  };

  // Convenience methods
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

  const submitReview = async (
    flashcardId: string,
    response: "again" | "hard" | "good" | "easy",
    responseTime: number,
    studyMode?: string
  ) => {
    return submitReviewMutation.mutateAsync({
      flashcardId,
      response,
      responseTime,
      studyMode,
    });
  };

  return {
    // Query Client
    queryClient,

    // Mutations
    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
    generateFlashcardsFromQuizMutation,
    createDeckMutation,
    submitReviewMutation,

    // Queries
    useUserDecks,
    useStudyProgress,

    // Convenience methods
    generateFlashcards,
    generateFlashcardsFromFile,
    generateFlashcardsFromQuiz,
    getUserDecks,
    createDeck,
    getDeckFlashcards,
    getCardsForReview,
    submitReview,
    getStudyProgress,
  };
};
