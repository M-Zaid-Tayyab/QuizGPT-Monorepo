import colors from "@/app/constants/colors";

export interface QuestionOption {
  label: string;
  value: string;
  icon: string;
  color: string;
  description?: string;
}

export type QuestionType = "single" | "multiple" | "text" | "chips" | "slider";

export interface Question {
  id: number;
  question: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  type: QuestionType;
  
  // Text Input props
  placeholder?: string;
  keyboardType?: "numeric" | "default";
  maxLength?: number;
  
  // Slider props
  min?: number;
  max?: number;
  step?: number;
  sliderLabels?: { left: string; right: string };
  
  // Multi-select props
  maxSelections?: number;
  
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
      type: "single",
      question: "What brings you here today?",
      subtitle: "Let's start by understanding your primary motivation",
      icon: "rocket-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "I want to improve my grades",
          value: "improve_grades",
          icon: "school-outline",
          color: colors.success,
          description: "Aiming for better results",
        },
        {
          label: "I have an exam coming up",
          value: "exam_prep",
          icon: "calendar-outline",
          color: colors.warning,
          description: "Need focused preparation",
        },
        {
          label: "I want to learn faster",
          value: "learn_faster",
          icon: "flash-outline",
          color: colors.blue,
          description: "Optimize study time",
        },
        {
          label: "I'm just curious",
          value: "curious",
          icon: "help-circle-outline",
          color: colors.purple,
          description: "Exploring options",
        },
      ],
    },
    {
      id: 2,
      type: "slider",
      question: "How do you feel about your studies?",
      subtitle: "Slide to rate your current confidence level",
      icon: "thermometer-outline",
      iconColor: colors.error,
      min: 1,
      max: 10,
      step: 1,
      sliderLabels: { left: "Stressed", right: "Confident" },
      options: [], // Slider doesn't use options but structure requires it
    },
    {
      id: 3,
      type: "chips",
      question: "What's the hardest part about studying?",
      subtitle: "Select all that apply",
      icon: "alert-circle-outline",
      iconColor: colors.warning,
      maxSelections: 3,
      options: [
        { label: "Procrastination", value: "procrastination", icon: "time-outline", color: colors.error },
        { label: "Lack of focus", value: "focus", icon: "aperture-outline", color: colors.warning },
        { label: "Hard to memorize", value: "memory", icon: "bulb-outline", color: colors.blue },
        { label: "Exam anxiety", value: "anxiety", icon: "heart-dislike-outline", color: colors.pink },
        { label: "Boring material", value: "boredom", icon: "cafe-outline", color: colors.purple },
        { label: "Time management", value: "time", icon: "hourglass-outline", color: colors.primary },
        { label: "Understanding concepts", value: "understanding", icon: "help-buoy-outline", color: colors.success },
        { label: "Distractions", value: "distractions", icon: "phone-portrait-outline", color: colors.error },
      ],
    },
    {
      id: 4,
      type: "single",
      question: "How often do you study?",
      subtitle: "Be honest, this helps us tailor your plan",
      icon: "calendar-number-outline",
      iconColor: colors.blue,
      options: [
        { label: "Every day", value: "daily", icon: "flame-outline", color: colors.error, description: "Consistent effort" },
        { label: "A few times a week", value: "weekly", icon: "calendar-outline", color: colors.primary, description: "Regular schedule" },
        { label: "Only before exams", value: "cramming", icon: "alarm-outline", color: colors.warning, description: "Last minute hero" },
        { label: "Rarely", value: "rarely", icon: "moon-outline", color: colors.purple, description: "Need motivation" },
      ],
    },
    {
      id: 5,
      type: "single",
      question: "What is your main goal right now?",
      subtitle: "Pick the most important one",
      icon: "trophy-outline",
      iconColor: colors.success,
      options: [
        { label: "Ace my next exam", value: "ace_exam", icon: "star-outline", color: colors.success },
        { label: "Master a specific subject", value: "master_subject", icon: "book-outline", color: colors.blue },
        { label: "Build a study habit", value: "build_habit", icon: "construct-outline", color: colors.primary },
        { label: "Catch up on classes", value: "catch_up", icon: "play-skip-forward-outline", color: colors.warning },
      ],
    },
    {
      id: 6,
      type: "multiple",
      question: "How do you learn best?",
      subtitle: "Select your preferred learning styles",
      icon: "color-palette-outline",
      iconColor: colors.purple,
      maxSelections: 2,
      options: [
        { label: "Visual (Images/Diagrams)", value: "visual", icon: "image-outline", color: colors.blue, description: "Learning by seeing" },
        { label: "Auditory (Listening)", value: "auditory", icon: "headset-outline", color: colors.purple, description: "Learning by hearing" },
        { label: "Reading/Writing", value: "read_write", icon: "pencil-outline", color: colors.primary, description: "Text-based learning" },
        { label: "Kinesthetic (Doing)", value: "kinesthetic", icon: "hand-left-outline", color: colors.success, description: "Hands-on practice" },
      ],
    },
    {
      id: 7,
      type: "multiple",
      question: "What study materials do you use?",
      subtitle: "We can help optimize these",
      icon: "library-outline",
      iconColor: colors.primary,
      options: [
        { label: "Textbooks", value: "textbooks", icon: "book-outline", color: colors.blue, description: "Standard books" },
        { label: "Lecture Notes", value: "notes", icon: "document-text-outline", color: colors.warning, description: "Class notes" },
        { label: "Online Videos", value: "videos", icon: "play-circle-outline", color: colors.error, description: "YouTube, etc." },
        { label: "Practice Exams", value: "practice_exams", icon: "clipboard-outline", color: colors.purple, description: "Mock tests" },
      ],
    },
    {
      id: 8,
      type: "chips",
      question: "Which subjects are hardest for you?",
      subtitle: "We'll focus more on these",
      icon: "school-outline",
      iconColor: colors.error,
      maxSelections: 5,
      options: [
        { label: "Math", value: "math", icon: "calculator-outline", color: colors.blue },
        { label: "Science", value: "science", icon: "flask-outline", color: colors.success },
        { label: "History", value: "history", icon: "time-outline", color: colors.warning },
        { label: "Literature", value: "literature", icon: "book-outline", color: colors.purple },
        { label: "Languages", value: "languages", icon: "chatbubbles-outline", color: colors.pink },
        { label: "Coding", value: "coding", icon: "code-slash-outline", color: colors.primary },
        { label: "Business", value: "business", icon: "briefcase-outline", color: colors.lightPink },
        { label: "Social Studies", value: "social_studies", icon: "people-outline", color: colors.blue },
        { label: "Arts", value: "arts", icon: "color-palette-outline", color: colors.orange },
      ],
    },
    {
      id: 9,
      type: "single",
      question: "Do you tend to procrastinate?",
      subtitle: "It's okay, we all do sometimes",
      icon: "timer-outline",
      iconColor: colors.warning,
      options: [
        { label: "All the time", value: "always", icon: "sad-outline", color: colors.error, description: "It's a real struggle" },
        { label: "Sometimes", value: "sometimes", icon: "alert-outline", color: colors.warning, description: "Depends on the subject" },
        { label: "Rarely", value: "rarely", icon: "happy-outline", color: colors.success, description: "I'm pretty disciplined" },
        { label: "Never", value: "never", icon: "medal-outline", color: colors.blue, description: "I am a machine" },
      ],
    },
    {
      id: 10,
      type: "single",
      question: "How close is your next big exam?",
      subtitle: "Time helps us prioritize",
      icon: "alarm-outline",
      iconColor: colors.error,
      options: [
        { label: "This week", value: "this_week", icon: "flame-outline", color: colors.error, description: "Crunch time!" },
        { label: "Next week", value: "next_week", icon: "calendar-outline", color: colors.warning, description: "Getting close" },
        { label: "Next month", value: "next_month", icon: "calendar-number-outline", color: colors.primary, description: "Some time left" },
        { label: "No exams soon", value: "none", icon: "cafe-outline", color: colors.success, description: "Just studying" },
      ],
    },
    {
      id: 11,
      type: "single",
      question: "Have you tried Active Recall?",
      subtitle: "Testing yourself instead of just reading",
      icon: "refresh-circle-outline",
      iconColor: colors.success,
      options: [
        { label: "Yes, I love it", value: "yes_love", icon: "heart-outline", color: colors.success, description: "It works great" },
        { label: "I've heard of it", value: "heard_of", icon: "ear-outline", color: colors.blue, description: "Haven't tried much" },
        { label: "No, what's that?", value: "no", icon: "help-circle-outline", color: colors.warning, description: "Tell me more" },
      ],
    },
    {
      id: 12,
      type: "single",
      question: "Have you tried Spaced Repetition?",
      subtitle: "Reviewing at specific intervals",
      icon: "infinite-outline",
      iconColor: colors.purple,
      options: [
        { label: "Yes, use Anki etc.", value: "yes_anki", icon: "layers-outline", color: colors.success, description: "I'm a pro" },
        { label: "Tried it once", value: "tried", icon: "refresh-outline", color: colors.blue, description: "Was okay" },
        { label: "Never heard of it", value: "never", icon: "help-circle-outline", color: colors.warning, description: "Sounds complex" },
      ],
    },
    {
      id: 13,
      type: "chips",
      question: "Where do you usually study?",
      subtitle: "Select your main spots",
      icon: "map-outline",
      iconColor: colors.blue,
      maxSelections: 3,
      options: [
        { label: "Bedroom", value: "bedroom", icon: "bed-outline", color: colors.purple },
        { label: "Library", value: "library", icon: "library-outline", color: colors.primary },
        { label: "Cafe", value: "cafe", icon: "cafe-outline", color: colors.warning },
        { label: "School/Uni", value: "school", icon: "school-outline", color: colors.blue },
        { label: "Living Room", value: "living_room", icon: "home-outline", color: colors.success },
        { label: "Outdoors", value: "outdoors", icon: "leaf-outline", color: colors.success },
        { label: "Commute", value: "commute", icon: "bus-outline", color: colors.error },
        { label: "Late night desk", value: "late_night", icon: "moon-outline", color: colors.darkPurple },
      ],
    },
    {
      id: 14,
      type: "slider",
      question: "How long can you focus?",
      subtitle: "In minutes, before getting distracted",
      icon: "stopwatch-outline",
      iconColor: colors.primary,
      min: 10,
      max: 120,
      step: 5,
      sliderLabels: { left: "10m", right: "120m" },
      options: [],
    },
    {
      id: 15,
      type: "single",
      question: "Do you prefer studying alone or with others?",
      subtitle: "Social style matters",
      icon: "people-outline",
      iconColor: colors.pink,
      options: [
        { label: "Alone", value: "alone", icon: "person-outline", color: colors.blue, description: "Peace and quiet" },
        { label: "With friends", value: "friends", icon: "people-outline", color: colors.purple, description: "Group motivation" },
        { label: "Mix of both", value: "mix", icon: "git-merge-outline", color: colors.success, description: "Depends on mood" },
      ],
    },
    {
      id: 16,
      type: "multiple",
      question: "What tools have you used before?",
      subtitle: "Select all that apply",
      icon: "construct-outline",
      iconColor: colors.warning,
      options: [
        { label: "Quizlet", value: "quizlet", icon: "card-outline", color: colors.blue, description: "Flashcards" },
        { label: "Anki", value: "anki", icon: "layers-outline", color: colors.textSecondary, description: "Spaced Repetition" },
        { label: "ChatGPT", value: "chatgpt", icon: "hardware-chip-outline", color: colors.success, description: "AI Help" },
        { label: "Khan Academy", value: "khan", icon: "play-outline", color: colors.success, description: "Videos" },
      ],
    },
    {
      id: 17,
      type: "chips",
      question: "What motivates you?",
      subtitle: "What keeps you going?",
      icon: "flame-outline",
      iconColor: colors.error,
      maxSelections: 3,
      options: [
        { label: "Good grades", value: "grades", icon: "school-outline", color: colors.primary },
        { label: "Career goals", value: "career", icon: "briefcase-outline", color: colors.blue },
        { label: "Personal growth", value: "growth", icon: "trending-up-outline", color: colors.success },
        { label: "Competition", value: "competition", icon: "trophy-outline", color: colors.warning },
        { label: "Making parents proud", value: "parents", icon: "happy-outline", color: colors.purple },
        { label: "Fear of failure", value: "fear", icon: "alert-outline", color: colors.error },
        { label: "University admission", value: "university", icon: "business-outline", color: colors.blue },
        { label: "Scholarship", value: "scholarship", icon: "cash-outline", color: colors.success },
      ],
    },
    {
      id: 18,
      type: "multiple",
      question: "What do you want most from this app?",
      subtitle: "We'll customize your experience",
      icon: "gift-outline",
      iconColor: colors.pink,
      options: [
        { label: "Practice Questions", value: "questions", icon: "help-circle-outline", color: colors.primary, description: "Test my knowledge" },
        { label: "AI Explanations", value: "explanations", icon: "chatbubble-ellipses-outline", color: colors.blue, description: "Understand deeper" },
        { label: "Study Plan", value: "plan", icon: "calendar-outline", color: colors.success, description: "Get organized" },
        { label: "Summaries", value: "summaries", icon: "document-text-outline", color: colors.warning, description: "Quick review" },
      ],
    },
    {
      id: 19,
      type: "single",
      question: "Which feature sounds most useful?",
      subtitle: "If you could only pick one",
      icon: "star-outline",
      iconColor: colors.warning,
      options: [
        { label: "Instant Answers", value: "instant_answers", icon: "flash-outline", color: colors.warning, description: "Quick solutions" },
        { label: "Step-by-step Guides", value: "guides", icon: "list-outline", color: colors.blue, description: "Detailed help" },
        { label: "Mock Exams", value: "mock_exams", icon: "clipboard-outline", color: colors.primary, description: "Exam simulation" },
      ],
    },
    {
      id: 20,
      type: "text",
      question: "How old are you?",
      subtitle: "This helps us create age-appropriate content",
      icon: "person-outline",
      iconColor: colors.primary,
      placeholder: "00",
      keyboardType: "numeric",
      maxLength: 2,
      options: [],
    },
  ],
};
