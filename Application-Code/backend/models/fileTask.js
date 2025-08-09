const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

class FileStorage {
  constructor() {
    this.ensureFileExists();
  }

  async ensureFileExists() {
    try {
      await fs.access(DB_FILE);
    } catch (error) {
      // File doesn't exist, create it with empty data
      await fs.writeFile(DB_FILE, JSON.stringify({ tasks: [], nextId: 1 }, null, 2));
    }
  }

  async readData() {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error reading data file:', sanitizedError);
      return { tasks: [], nextId: 1 };
    }
  }

  async writeData(data) {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error writing data file:', sanitizedError);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

const storage = new FileStorage();

// Task model simulation
class Task {
  constructor(taskData) {
    this._id = storage.generateId();
    this.task = taskData.task;
    this.description = taskData.description || '';
    this.completed = taskData.completed || false;
    this.priority = taskData.priority || 'medium';
    this.category = taskData.category || 'other';
    this.dueDate = taskData.dueDate || null;
    this.tags = taskData.tags || [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async find(filter = {}) {
    const data = await storage.readData();
    let tasks = data.tasks;

    // Apply filters
    if (filter.completed !== undefined) {
      tasks = tasks.filter(task => task.completed === filter.completed);
    }
    if (filter.priority) {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }
    if (filter.category) {
      tasks = tasks.filter(task => task.category === filter.category);
    }
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.task.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (filter.sortBy) {
      tasks.sort((a, b) => {
        const aVal = a[filter.sortBy];
        const bVal = b[filter.sortBy];
        
        if (filter.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Apply pagination
    if (filter.page && filter.limit) {
      const start = (filter.page - 1) * filter.limit;
      const end = start + parseInt(filter.limit);
      tasks = tasks.slice(start, end);
    }

    return tasks;
  }

  static async countDocuments(filter = {}) {
    const data = await storage.readData();
    let tasks = data.tasks;

    if (filter.completed !== undefined) {
      tasks = tasks.filter(task => task.completed === filter.completed);
    }
    if (filter.priority) {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }
    if (filter.category) {
      tasks = tasks.filter(task => task.category === filter.category);
    }
    if (filter.dueDate && filter.dueDate.$lt) {
      tasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < filter.dueDate.$lt
      );
    }

    return tasks.length;
  }

  static async aggregate(pipeline) {
    const data = await storage.readData();
    const tasks = data.tasks;

    // Simple aggregation for grouping
    if (pipeline[0] && pipeline[0].$group) {
      const groupBy = pipeline[0].$group._id.replace('$', '');
      const result = {};
      
      tasks.forEach(task => {
        const key = task[groupBy];
        if (!result[key]) {
          result[key] = 0;
        }
        result[key]++;
      });

      return Object.entries(result).map(([key, count]) => ({
        _id: key,
        count
      }));
    }

    return [];
  }

  async save() {
    const data = await storage.readData();
    data.tasks.push(this);
    await storage.writeData(data);
    return this;
  }

  static async findOneAndUpdate(filter, updates, options = {}) {
    const data = await storage.readData();
    const taskIndex = data.tasks.findIndex(task => task._id === filter._id);
    
    if (taskIndex === -1) {
      return null;
    }

    const updatedTask = { 
      ...data.tasks[taskIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    data.tasks[taskIndex] = updatedTask;
    await storage.writeData(data);
    
    return options.new ? updatedTask : data.tasks[taskIndex];
  }

  static async findByIdAndDelete(id) {
    const data = await storage.readData();
    const taskIndex = data.tasks.findIndex(task => task._id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    const deletedTask = data.tasks.splice(taskIndex, 1)[0];
    await storage.writeData(data);
    return deletedTask;
  }

  static async updateMany(filter, updates) {
    const data = await storage.readData();
    let modifiedCount = 0;

    if (filter._id && filter._id.$in) {
      data.tasks.forEach(task => {
        if (filter._id.$in.includes(task._id)) {
          Object.assign(task, updates, { updatedAt: new Date().toISOString() });
          modifiedCount++;
        }
      });
    }

    await storage.writeData(data);
    return { modifiedCount };
  }

  static async deleteMany(filter) {
    const data = await storage.readData();
    let deletedCount = 0;

    if (filter._id && filter._id.$in) {
      data.tasks = data.tasks.filter(task => {
        if (filter._id.$in.includes(task._id)) {
          deletedCount++;
          return false;
        }
        return true;
      });
    }

    await storage.writeData(data);
    return { deletedCount };
  }
}

module.exports = Task;
