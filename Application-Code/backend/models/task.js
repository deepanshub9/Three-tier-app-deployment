const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    task: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    completed: {
        type: Boolean,
        default: false,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['work', 'personal', 'shopping', 'health', 'education', 'other'],
        default: 'other'
    },
    dueDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }]
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

taskSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model("task", taskSchema);
