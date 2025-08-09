import axios from "axios";

const apiUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3500/api/tasks";
console.log('API URL:', apiUrl);

// Configure axios defaults
axios.defaults.timeout = 10000;

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const taskService = {
    // Get all tasks with optional filters
    getTasks: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        
        const response = await axios.get(`${apiUrl}?${params}`);
        return response.data;
    },

    // Get task statistics
    getTaskStats: async () => {
        const response = await axios.get(`${apiUrl}/stats`);
        return response.data;
    },

    // Add a new task
    addTask: async (taskData) => {
        try {
            const response = await axios.post(apiUrl, taskData);
            return response.data;
        } catch (error) {
            console.error('Add task error:', error);
            throw error;
        }
    },

    // Update a task
    updateTask: async (id, updates) => {
        const response = await axios.put(`${apiUrl}/${id}`, updates);
        return response.data;
    },

    // Delete a task
    deleteTask: async (id) => {
        const response = await axios.delete(`${apiUrl}/${id}`);
        return response.data;
    },

    // Bulk operations
    bulkOperation: async (action, taskIds) => {
        const response = await axios.post(`${apiUrl}/bulk`, { action, taskIds });
        return response.data;
    }
};

// Legacy functions for backward compatibility
export function getTasks(filters) {
    return taskService.getTasks(filters);
}

export function addTask(task) {
    return taskService.addTask(task);
}

export function updateTask(id, task) {
    return taskService.updateTask(id, task);
}

export function deleteTask(id) {
    return taskService.deleteTask(id);
}
