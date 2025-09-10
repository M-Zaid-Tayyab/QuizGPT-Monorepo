import mongoose from 'mongoose';

const anonymousUserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    streak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastQuizDate: Date
    },
    statistics: {
        totalQuizzes: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        totalCorrectAnswers: {
            type: Number,
            default: 0
        }
    },
    age: {
        type: Number,
        required: true,
    },
    grade: {
        type: String,
        enum: ['School', 'College', 'University', 'Post-Graduate'],
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
    },
    referral: {
        type: String,
        enum: ["tiktok","instagram","play_store","friend","other"],
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    isProUser: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('AnonymousUser', anonymousUserSchema); 