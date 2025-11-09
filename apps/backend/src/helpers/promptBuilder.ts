import { QuizOptions } from "./quizGenerationHelpers";

export class PromptBuilder {
  static buildOptimizedPrompt(
    description: string,
    options: QuizOptions
  ): string {
    const {
      difficulty,
      questionTypes,
      numberOfQuestions,
      user,
      examType = "general",
    } = options;
    const { age, grade } = user;

    const distribution = this.calculateQuestionDistribution(
      numberOfQuestions,
      questionTypes
    );

    const examContext = this.getExamTypeContext(examType);

    return `Analyze the following study material/content and create a comprehensive ${
      examContext.title
    } quiz designed to help a ${age ? `${age}-year-old ` : ""}student in ${grade} grade ACE their upcoming ${
      examContext.examName
    }.

STUDY MATERIAL/CONTENT TO ANALYZE:
${description}

🎯 IMPORTANT: Generate a concise, descriptive title (max 60 characters) that accurately reflects the MAIN TOPIC/CONCEPT from the actual content above. The title should be based on analyzing the content, not just copying user instructions.

Please respond with a valid JSON object containing the quiz questions.

${examContext.instructions}

📚 QUIZ CONFIGURATION:
- Difficulty Level: ${difficulty.toUpperCase()} (matching exam standards)
- Total Questions: ${numberOfQuestions}
- Target Audience: ${age ? `${age}-year-old ` : ""}student in ${grade} grade
- Question Types Selected: ${questionTypes.join(", ").toUpperCase()}

📚 QUESTION DISTRIBUTION:
${this.formatQuestionDistribution(distribution)}

🚨🚨🚨 CRITICAL INSTRUCTION - READ CAREFULLY 🚨🚨🚨
ONLY GENERATE THE EXACT QUESTION TYPES LISTED IN THE DISTRIBUTION ABOVE!
DO NOT GENERATE ANY OTHER QUESTION TYPES!

If the distribution shows only "true_false" questions, generate ONLY true/false questions.
If the distribution shows only "fill_blank" questions, generate ONLY fill-in-the-blank questions.
If the distribution shows multiple types, generate ONLY those specific types in the exact numbers shown.

FORBIDDEN: Do NOT generate "mcq" questions unless explicitly listed in the distribution above.
FORBIDDEN: Do NOT generate any question types not mentioned in the distribution above.

FOLLOW THE DISTRIBUTION EXACTLY - NO EXCEPTIONS!

📝 EXAM-STYLE QUESTION GUIDELINES:
- Make questions CHALLENGING but fair (like real exams)
- Use precise, academic language appropriate for ${grade} level
- Include questions that test UNDERSTANDING, not just memorization
- Create questions that require CRITICAL THINKING and problem-solving
- Focus on CONCEPTS that are frequently tested in exams
- Include questions that help students PRACTICE under exam conditions

🔥 EXAM PREPARATION TIPS TO INCLUDE:
- Questions should help students identify their WEAK AREAS
- Include questions that test COMMON EXAM MISTAKES
- Create questions that reinforce KEY FORMULAS, DEFINITIONS, and CONCEPTS
- Focus on topics that are LIKELY TO APPEAR on the actual exam
- Include questions that test TIME-MANAGEMENT skills (clear, concise questions)

📋 QUESTION FORMAT REQUIREMENTS:
- Each question must be CLEAR and UNAMBIGUOUS (like exam questions)
- For MCQ: Provide exactly 4 options with ONE clearly correct answer
- For True/False: Use statements that are DEFINITIVELY true or false (NO extra text like "(True/False)")
- For Fill-in-the-blank: Use ____ for blanks and provide the correct answer (question must end with ____)
- Mix question types randomly to simulate REAL EXAM CONDITIONS

🚨 FORMAT EXAMPLES:
- True/False: "A run-on sentence contains multiple independent clauses." (NOT "A run-on sentence contains multiple independent clauses. (True/False)")
- Fill-in-the-blank: "The _______ of a sentence contains a subject and predicate." (NOT "The _______ of a sentence contains a subject and predicate. (Fill in the blank)")
- MCQ: "Which of the following is a compound sentence?" with 4 options

🚫 CRITICAL TECHNICAL RULES:
- Use EXACTLY these questionType values: "mcq", "true_false", "fill_blank"
- correctAnswer must be a NUMBER (0, 1, 2, 3 for MCQ; 0, 1 for True/False; 0 for Fill-in-the-blank)
- For fill_blank questions, options array must contain ONLY the correct answer
- For true_false questions, options must be exactly ["True", "False"]
- For MCQ questions, options must be exactly 4 different choices

📋 RESPONSE FORMAT:
Return a JSON object with this EXACT structure:
{
  "title": "[AI-Generated Topic Title]",
  "questions": [
    {
      "question": "Question text here?",
      "questionType": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

🎯 TITLE GENERATION RULES:
- Analyze the STUDY MATERIAL/CONTENT provided above
- Extract the MAIN TOPIC, CONCEPT, or SUBJECT from the actual content
- Generate a concise, descriptive title (max 60 characters) that accurately represents the content
- DO NOT simply copy user instructions - ANALYZE the content to determine the true topic
- The title should be specific and informative (e.g., "Photosynthesis Process" not "Biology Quiz")
- Base the title on the actual study material, not assumptions

🎯 EXAM SUCCESS MISSION:
Generate ${numberOfQuestions} questions that will help this student:
1. IDENTIFY their knowledge gaps
2. PRACTICE under exam-like conditions  
3. MASTER the material thoroughly
4. BUILD confidence for their actual exam
5. ACE their upcoming test!

Make every question count towards their exam success!

🚨 FINAL REMINDER: Generate ONLY the question types listed in the distribution above. Do NOT add any other question types!`;
  }

  private static calculateQuestionDistribution(
    total: number,
    types: string[]
  ): Record<string, number> {
    const base = Math.floor(total / types.length);
    const remainder = total % types.length;

    const distribution: Record<string, number> = {};
    types.forEach((type, index) => {
      distribution[type] = base + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  private static formatQuestionDistribution(
    distribution: Record<string, number>
  ): string {
    return Object.entries(distribution)
      .map(([type, count]) => `- ${count} ${this.getQuestionTypeLabel(type)}`)
      .join("\n");
  }

  private static getQuestionTypeLabel(type: string): string {
    switch (type) {
      case "mcq":
        return "Multiple Choice Questions (4 options each)";
      case "true_false":
        return "True/False Questions";
      case "fill_blank":
        return "Fill-in-the-blank Questions";
      default:
        return `${type} Questions`;
    }
  }

  private static getExamTypeContext(examType: string): {
    title: string;
    examName: string;
    instructions: string;
  } {
    switch (examType.toLowerCase()) {
      case "sat_act":
        return {
          title: "SAT/ACT PREPARATION",
          examName: "SAT/ACT exams",
          instructions: `🎯 SAT/ACT EXAM PREPARATION FOCUS:
- Create questions that mirror ACTUAL SAT/ACT question formats and difficulty
- Focus on HIGH-FREQUENCY topics commonly tested on these standardized exams
- Use SAT/ACT-style language: clear, concise, and precise
- Include questions that test CRITICAL READING, REASONING, and PROBLEM-SOLVING skills
- Emphasize time-efficient questions (students have limited time per question)
- Cover topics across Math, Reading, Writing, and Science sections
- Make questions challenging enough to match actual exam rigor
- Include questions that help students practice STRATEGY and TECHNIQUE`,
        };
      case "ap":
        return {
          title: "AP EXAM PREPARATION",
          examName: "AP exam",
          instructions: `🎯 AP EXAM PREPARATION FOCUS:
- Create questions that align with AP exam standards and format
- Focus on CURRICULUM-ALIGNED content from AP course materials
- Use AP-style terminology and academic language
- Include questions that test DEPTH OF UNDERSTANDING and APPLICATION
- Emphasize questions that prepare students for both multiple-choice and free-response sections
- Cover ESSENTIAL COURSE CONTENT that appears frequently on AP exams
- Make questions academically rigorous (AP exams are college-level)
- Include questions that test students' ability to SYNTHESIZE and ANALYZE`,
        };
      case "final":
        return {
          title: "FINAL EXAM PREPARATION",
          examName: "final exam",
          instructions: `🎯 FINAL EXAM PREPARATION FOCUS:
- Create comprehensive questions that cover ENTIRE SEMESTER/COURSE content
- Focus on MAJOR CONCEPTS, THEMES, and LEARNING OBJECTIVES from the course
- Use questions that test cumulative knowledge and understanding
- Include questions that help students identify COMPREHENSIVE knowledge gaps
- Emphasize questions that test CONNECTIONS between different topics learned
- Cover HIGH-WEIGHT topics that typically appear on final exams
- Make questions challenging but fair, reflecting actual final exam difficulty
- Include questions that help students PRACTICE under final exam conditions`,
        };
      case "midterm":
        return {
          title: "MIDTERM EXAM PREPARATION",
          examName: "midterm exam",
          instructions: `🎯 MIDTERM EXAM PREPARATION FOCUS:
- Create questions covering MATERIAL UP TO THE MIDTERM POINT
- Focus on KEY CONCEPTS and topics from the first half of the course
- Use questions that test understanding of foundational material
- Include questions that help students assess their PROGRESS so far
- Emphasize questions that build CONFIDENCE for the second half of the course
- Cover IMPORTANT TOPICS that typically appear on midterm exams
- Make questions appropriately challenging for mid-semester assessment
- Include questions that help students identify areas needing MORE FOCUS`,
        };
      case "chapter":
        return {
          title: "CHAPTER REVIEW",
          examName: "chapter review",
          instructions: `🎯 CHAPTER REVIEW FOCUS:
- Create questions that focus on SPECIFIC CHAPTER/CONTENT AREA
- Focus on KEY CONCEPTS, DEFINITIONS, and EXAMPLES from this chapter
- Use questions that reinforce chapter-specific learning objectives
- Include questions that help students MASTER the chapter content
- Emphasize questions that test understanding of chapter material in detail
- Cover IMPORTANT TOPICS from this specific chapter or unit
- Make questions appropriate for chapter-level assessment
- Include questions that help students identify what they've LEARNED vs what needs REVIEW`,
        };
      case "custom":
        return {
          title: "CUSTOM EXAM PREPARATION",
          examName: "custom exam",
          instructions: `🎯 CUSTOM EXAM PREPARATION FOCUS:
- Create questions tailored to the student's SPECIFIC LEARNING NEEDS
- Focus on areas the student wants to practice or improve
- Use questions that address the student's PARTICULAR CONCERNS or GOALS
- Include questions that help students ACHIEVE their specific learning objectives
- Emphasize questions that are RELEVANT to the student's unique situation
- Cover topics that are MOST IMPORTANT for this student's success
- Make questions that are PERSONALIZED to the student's learning path
- Include questions that help students address their SPECIFIC CHALLENGES`,
        };
      default:
        return {
          title: "EXAM PREPARATION",
          examName: "upcoming exams",
          instructions: `🎯 EXAM PREPARATION FOCUS:
- Create questions that mirror ACTUAL EXAM PATTERNS and formats
- Focus on HIGH-YIELD topics that are commonly tested
- Include questions that test both RECALL and APPLICATION
- Use EXAM-LIKE language and terminology
- Cover CRITICAL CONCEPTS that students must master
- Include questions that help identify KNOWLEDGE GAPS`,
        };
    }
  }
}
