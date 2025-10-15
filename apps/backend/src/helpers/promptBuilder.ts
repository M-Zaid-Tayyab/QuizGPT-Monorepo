import { QuizOptions } from "./quizGenerationHelpers";

export class PromptBuilder {
  static buildOptimizedPrompt(
    description: string,
    options: QuizOptions
  ): string {
    const { difficulty, questionTypes, numberOfQuestions, user } = options;
    const { age, grade, gender } = user;

    const distribution = this.calculateQuestionDistribution(
      numberOfQuestions,
      questionTypes
    );

    return `Create a comprehensive EXAM PREPARATION quiz about "${description}" designed to help a ${age}-year-old ${gender} student in ${grade} grade ACE their upcoming exams.

Please respond with a valid JSON object containing the quiz questions.

🎯 EXAM PREPARATION FOCUS:
- Difficulty Level: ${difficulty.toUpperCase()} (matching exam standards)
- Total Questions: ${numberOfQuestions}
- Target Audience: ${age}-year-old ${gender} in ${grade} grade
- Question Types: ${questionTypes.join(", ").toUpperCase()}
- Purpose: PRACTICE FOR UPCOMING EXAMS

📚 QUESTION DISTRIBUTION:
${this.formatQuestionDistribution(distribution)}

🎓 EXAM SUCCESS STRATEGY:
- Create questions that mirror ACTUAL EXAM PATTERNS and formats
- Focus on HIGH-YIELD topics that are commonly tested
- Include questions that test both RECALL and APPLICATION
- Use EXAM-LIKE language and terminology
- Cover CRITICAL CONCEPTS that students must master
- Include questions that help identify KNOWLEDGE GAPS

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
  "title": "[Topic Name]",
  "questions": [
    {
      "question": "Question text here?",
      "questionType": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

IMPORTANT: Replace [Topic Name] with the actual topic from the description.

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
}
