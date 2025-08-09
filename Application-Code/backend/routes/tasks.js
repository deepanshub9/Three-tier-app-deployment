const express = require("express");
const Joi = require("joi");
const Task = process.env.USE_MONGODB === 'true' 
    ? require("../models/task")
    : require("../models/fileTask");
const router = express.Router();

// Validation schema
const taskValidationSchema = Joi.object({
    task: Joi.string().trim().min(1).max(500).required(),
    description: Joi.string().trim().max(1000).allow(''),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    category: Joi.string().valid('work', 'personal', 'shopping', 'health', 'education', 'other').default('other'),
    dueDate: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(10)
});

const updateTaskValidationSchema = Joi.object({
    task: Joi.string().trim().min(1).max(500),
    description: Joi.string().trim().max(1000).allow(''),
    completed: Joi.boolean(),
    priority: Joi.string().valid('low', 'medium', 'high'),
    category: Joi.string().valid('work', 'personal', 'shopping', 'health', 'education', 'other'),
    dueDate: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(10)
});

// Create a new task
router.post("/", async (req, res) => {
    try {
        const { error, value } = taskValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.details[0].message 
            });
        }

        const task = await new Task(value).save();
        res.status(201).json({
            success: true,
            data: task,
            message: "Task created successfully"
        });
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.error('Error creating task:', sanitizedError);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create task" 
        });
    }
});

// Get all tasks with filtering and sorting
router.get("/", async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            completed, 
            priority, 
            category, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (completed !== undefined) {
            filter.completed = completed === 'true';
        }
        if (priority) {
            filter.priority = priority;
        }
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.$or = [
                { task: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination for MongoDB
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Handle different storage types
        let tasks, total;
        
        if (process.env.USE_MONGODB === 'true') {
            // MongoDB implementation
            tasks = await Task.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));
            total = await Task.countDocuments(filter);
        } else {
            // File-based implementation - use all data for now
            const allTasks = await Task.find(filter);
            total = allTasks.length;
            
            // Sort manually
            const sortKey = Object.keys(sort)[0] || 'createdAt';
            const sortDirection = Object.values(sort)[0] === 1 ? 1 : -1;
            allTasks.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) return -1 * sortDirection;
                if (a[sortKey] > b[sortKey]) return 1 * sortDirection;
                return 0;
            });
            
            // Apply pagination
            const startIndex = skip;
            const endIndex = skip + parseInt(limit);
            tasks = allTasks.slice(startIndex, endIndex);
        }

        res.json({
            success: true,
            data: tasks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalTasks: total,
                hasNext: skip + tasks.length < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.error('Error fetching tasks:', sanitizedError);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch tasks" 
        });
    }
});

// Get task statistics
router.get("/stats", async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ completed: true });
        const pendingTasks = totalTasks - completedTasks;
        
        const priorityStats = await Task.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);
        
        const categoryStats = await Task.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            completed: false
        });

        res.json({
            success: true,
            data: {
                total: totalTasks,
                completed: completedTasks,
                pending: pendingTasks,
                overdue: overdueTasks,
                priorityBreakdown: priorityStats,
                categoryBreakdown: categoryStats
            }
        });
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.error('Error fetching stats:', sanitizedError);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch statistics" 
        });
    }
});

// Update a task
router.put("/:id", async (req, res) => {
    try {
        const { error, value } = updateTaskValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.details[0].message 
            });
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id },
            value,
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            data: task,
            message: "Task updated successfully"
        });
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.error('Error updating task:', sanitizedError);
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid task ID" 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Failed to update task" 
        });
    }
});

// Delete a task
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            data: task,
            message: "Task deleted successfully"
        });
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.error('Error deleting task:', sanitizedError);
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid task ID" 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete task" 
        });
    }
});

// Bulk operations
router.post("/bulk", async (req, res) => {
    try {
        const { action, taskIds } = req.body;
        
        if (!action || !taskIds || !Array.isArray(taskIds)) {
            return res.status(400).json({
                success: false,
                message: "Action and taskIds array are required"
            });
        }

        let result;
        switch (action) {
            case 'complete':
                result = await Task.updateMany(
                    { _id: { $in: taskIds } },
                    { completed: true }
                );
                break;
            case 'incomplete':
                result = await Task.updateMany(
                    { _id: { $in: taskIds } },
                    { completed: false }
                );
                break;
            case 'delete':
                result = await Task.deleteMany({ _id: { $in: taskIds } });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid action. Use 'complete', 'incomplete', or 'delete'"
                });
        }

        res.json({
            success: true,
            data: result,
            message: `Bulk ${action} operation completed successfully`
        });
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.error('Error in bulk operation:', sanitizedError);
        res.status(500).json({ 
            success: false, 
            message: "Failed to perform bulk operation" 
        });
    }
});

module.exports = router;
