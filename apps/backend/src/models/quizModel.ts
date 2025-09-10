import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true
    },
    selectedAnswer: {
        type: Number,
        min: 0,
        max: 3
    }
});

const quizSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    userType: {
        type: String,
        enum: ['user', 'anonymous'],
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema); 