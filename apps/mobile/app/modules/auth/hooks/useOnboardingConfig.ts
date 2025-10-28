import colors from "@/app/constants/colors";

export interface QuestionOption {
  label: string;
  value: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Question {
  id: number;
  question: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  isTextInput?: boolean;
  placeholder?: string;
  keyboardType?: "numeric" | "default";
  maxLength?: number;
  options: QuestionOption[];
}

export interface OnboardingConfig {
  questions: Question[];
  maxOptions: number;
  animationDurations: {
    welcome: number;
    card: number;
    option: number;
    progress: number;
  };
  animationSettings: {
    damping: number;
    stiffness: number;
  };
}

export const ONBOARDING_CONFIG: OnboardingConfig = {
  maxOptions: 5,
  animationDurations: {
    welcome: 800,
    card: 300,
    option: 200,
    progress: 1000,
  },
  animationSettings: {
    damping: 15,
    stiffness: 100,
  },
  questions: [
    {
      id: 1,
      question: "What's your biggest study challenge?",
      subtitle: "Help us understand what's holding you back",
      icon: "alert-circle-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Can't find practice questions",
          value: "memory_retention",
          icon: "search-outline",
          color: colors.warning,
          description: "No relevant practice questions",
        },
        {
          label: "Don't know how to test myself",
          value: "time_management",
          icon: "help-circle-outline",
          color: colors.primary,
          description: "Struggling with self-assessment",
        },
        {
          label: "Too much content to study",
          value: "overwhelmed",
          icon: "trending-down-outline",
          color: colors.error,
          description: "Too much material to process",
        },
        {
          label: "Need exam-style questions",
          value: "focus_issues",
          icon: "school-outline",
          color: colors.blue,
          description: "Want exam-style practice",
        },
        {
          label: "Not sure what's important",
          value: "exam_anxiety",
          icon: "eye-off-outline",
          color: colors.pink,
          description: "Don't know what to focus on",
        },
      ],
    },
    {
      id: 2,
      question: "How do you currently prepare for exams?",
      subtitle: "Understanding your current study methods",
      icon: "book-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Search for questions online",
          value: "rereading",
          icon: "search-outline",
          color: colors.warning,
          description: "Hunting for relevant questions",
        },
        {
          label: "Use generic study apps",
          value: "highlighting",
          icon: "phone-portrait-outline",
          color: colors.blue,
          description: "One-size-fits-all content",
        },
        {
          label: "Just reread materials",
          value: "practice_problems",
          icon: "refresh-outline",
          color: colors.success,
          description: "Passive reading approach",
        },
        {
          label: "Study with friends",
          value: "study_groups",
          icon: "people-outline",
          color: colors.purple,
          description: "Collaborative learning",
        },
        {
          label: "Don't have a system",
          value: "no_system",
          icon: "help-circle-outline",
          color: colors.error,
          description: "Wing it and hope",
        },
      ],
    },
    {
      id: 3,
      question: "How confident do you feel before exams?",
      subtitle: "Understanding your exam anxiety levels",
      icon: "heart-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Very confident",
          value: "very_confident",
          icon: "checkmark-circle",
          color: colors.success,
          description: "I'm well prepared",
        },
        {
          label: "Somewhat confident",
          value: "somewhat_confident",
          icon: "thumbs-up-outline",
          color: colors.blue,
          description: "I'll probably do okay",
        },
        {
          label: "Not very confident",
          value: "not_confident",
          icon: "thumbs-down-outline",
          color: colors.warning,
          description: "I'm worried",
        },
        {
          label: "Panic mode",
          value: "panic_mode",
          icon: "alert-circle",
          color: colors.error,
          description: "I'm terrified",
        },
      ],
    },
    {
      id: 4,
      question: "What type of study materials do you use?",
      subtitle: "This helps us understand your study content",
      icon: "library-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Textbooks & PDFs",
          value: "textbooks_pdfs",
          icon: "book-outline",
          color: colors.lightPink,
          description: "Traditional study materials",
        },
        {
          label: "Lecture notes & slides",
          value: "lecture_notes",
          icon: "document-text-outline",
          color: colors.warning,
          description: "Class-based content",
        },
        {
          label: "Research papers",
          value: "research_papers",
          icon: "library-outline",
          color: colors.success,
          description: "Academic sources",
        },
        {
          label: "Mixed materials",
          value: "mixed_materials",
          icon: "grid-outline",
          color: colors.blue,
          description: "Various content types",
        },
      ],
    },
    {
      id: 5,
      question: "How old are you?",
      subtitle: "This helps us create age-appropriate content",
      icon: "person-outline",
      iconColor: colors.primary,
      isTextInput: true,
      placeholder: "00",
      keyboardType: "numeric",
      maxLength: 2,
      options: [
        {
          label: "14-18 years",
          value: "14-18",
          icon: "school-outline",
          color: colors.warning,
        },
        {
          label: "19-25 years",
          value: "19-25",
          icon: "man-outline",
          color: colors.success,
        },
        {
          label: "25+ years",
          value: "25+",
          icon: "business-outline",
          color: colors.blue,
        },
      ],
    },
    {
      id: 6,
      question: "What subjects do you struggle with most?",
      subtitle: "We'll create targeted content for your weak areas",
      icon: "school-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Math & Science",
          value: "math_science",
          icon: "calculator-outline",
          color: colors.blue,
          description: "Numbers and formulas",
        },
        {
          label: "Languages & Literature",
          value: "languages",
          icon: "book-outline",
          color: colors.purple,
          description: "Reading and writing",
        },
        {
          label: "History & Social Studies",
          value: "history_social",
          icon: "library-outline",
          color: colors.warning,
          description: "Memorization heavy",
        },
        {
          label: "All subjects",
          value: "all_subjects",
          icon: "grid-outline",
          color: colors.error,
          description: "Struggling across the board",
        },
      ],
    },
    {
      id: 7,
      question: "What would help you study better?",
      subtitle: "Tell us what you need most",
      icon: "bulb-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Exam-style practice questions",
          value: "exam_practice",
          icon: "school-outline",
          color: colors.success,
          description: "I want to know what the real test will be like",
        },
        {
          label: "Practice with my own materials",
          value: "memory_techniques",
          icon: "book-outline",
          color: colors.purple,
          description: "I want to practice with my notes and textbooks",
        },
        {
          label: "Know what's important to study",
          value: "study_structure",
          icon: "eye-outline",
          color: colors.blue,
          description: "I don't know what to focus on from all my materials",
        },
        {
          label: "Regular practice sessions",
          value: "faster_methods",
          icon: "refresh-outline",
          color: colors.primary,
          description: "I need to test myself consistently",
        },
        {
          label: "Questions that help me remember",
          value: "all_above",
          icon: "brain-outline",
          color: colors.warning,
          description: "I want effective practice that sticks",
        },
      ],
    },
  ],
};
