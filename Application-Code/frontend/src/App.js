import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Fab,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  Grid,
  Pagination,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  GetApp as ExportIcon,
  DeleteSweep as BulkDeleteIcon,
  CheckCircle as BulkCompleteIcon,
  RadioButtonUnchecked as BulkIncompleteIcon,
} from '@mui/icons-material';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import { taskService } from './services/taskServices';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import TaskFilters from './components/TaskFilters';
import TaskStats from './components/TaskStats';

const AppContent = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    completed: '',
    priority: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [bulkDialog, setBulkDialog] = useState({
    open: false,
    action: '',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks(filters);
      if (response.success) {
        setTasks(response.data);
        setPagination(response.pagination);
      } else {
        showSnackbar('Failed to load tasks', 'error');
      }
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error fetching tasks:', sanitizedError);
      showSnackbar('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await taskService.getTaskStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error fetching stats:', sanitizedError);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleAddTask = async (taskData) => {
    setSubmitting(true);
    try {
      const response = await taskService.addTask(taskData);
      if (response.success) {
        showSnackbar('Task added successfully!');
        fetchTasks();
        fetchStats();
        setShowForm(false);
      } else {
        showSnackbar(response.message || 'Failed to add task', 'error');
      }
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error adding task:', sanitizedError);
      showSnackbar('Failed to add task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const response = await taskService.updateTask(id, updates);
      if (response.success) {
        showSnackbar('Task updated successfully!');
        fetchTasks();
        fetchStats();
      } else {
        showSnackbar(response.message || 'Failed to update task', 'error');
      }
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error updating task:', sanitizedError);
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await taskService.deleteTask(id);
      if (response.success) {
        showSnackbar('Task deleted successfully!');
        fetchTasks();
        fetchStats();
        setSelectedTasks(prev => prev.filter(taskId => taskId !== id));
      } else {
        showSnackbar(response.message || 'Failed to delete task', 'error');
      }
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error('Error deleting task:', sanitizedError);
      showSnackbar('Failed to delete task', 'error');
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleTaskSelect = (taskId, selected) => {
    if (selected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedTasks(tasks.map(task => task._id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTasks.length === 0) return;

    try {
      const response = await taskService.bulkOperation(action, selectedTasks);
      if (response.success) {
        showSnackbar(`Bulk ${action} completed successfully!`);
        fetchTasks();
        fetchStats();
        setSelectedTasks([]);
        setBulkDialog({ open: false, action: '' });
      } else {
        showSnackbar(response.message || `Failed to perform bulk ${action}`, 'error');
      }
    } catch (error) {
      const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
      console.error(`Error performing bulk ${action}:`, sanitizedError);
      showSnackbar(`Failed to perform bulk ${action}`, 'error');
    }
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tasks_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSnackbar('Tasks exported successfully!');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📋 Modern Todo App
          </Typography>
          
          {selectedTasks.length > 0 && (
            <Badge badgeContent={selectedTasks.length} color="secondary" sx={{ mr: 2 }}>
              <IconButton 
                color="inherit" 
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>
            </Badge>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="default"
              />
            }
            label={darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            sx={{ ml: 1 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        <TaskStats stats={stats} loading={loading && !stats} />
        
        <TaskFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {showForm && (
          <TaskForm onSubmit={handleAddTask} loading={submitting} />
        )}

        {tasks.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedTasks.length === tasks.length}
                  indeterminate={selectedTasks.length > 0 && selectedTasks.length < tasks.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              }
              label={`Select All (${selectedTasks.length}/${tasks.length})`}
            />
          </Box>
        )}

        <Grid container spacing={viewMode === 'grid' ? 2 : 0}>
          {tasks.map((task) => (
            <Grid 
              item 
              xs={12} 
              sm={viewMode === 'grid' ? 6 : 12} 
              md={viewMode === 'grid' ? 4 : 12}
              key={task._id}
            >
              <TaskItem
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            </Grid>
          ))}
        </Grid>

        {tasks.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {Object.values(filters).some(v => v && v !== 'createdAt' && v !== 'desc' && v !== 1 && v !== 10)
                ? 'Try adjusting your filters or add a new task.'
                : 'Get started by adding your first task!'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              size="large"
            >
              Add Your First Task
            </Button>
          </Box>
        )}

        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>

      {!showForm && (
        <Fab
          color="primary"
          aria-label="add task"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowForm(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setBulkDialog({ open: true, action: 'complete' })}>
          <BulkCompleteIcon sx={{ mr: 1 }} />
          Mark as Complete
        </MenuItem>
        <MenuItem onClick={() => setBulkDialog({ open: true, action: 'incomplete' })}>
          <BulkIncompleteIcon sx={{ mr: 1 }} />
          Mark as Incomplete
        </MenuItem>
        <MenuItem onClick={exportTasks}>
          <ExportIcon sx={{ mr: 1 }} />
          Export Selected
        </MenuItem>
        <MenuItem 
          onClick={() => setBulkDialog({ open: true, action: 'delete' })}
          sx={{ color: 'error.main' }}
        >
          <BulkDeleteIcon sx={{ mr: 1 }} />
          Delete Selected
        </MenuItem>
      </Menu>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={bulkDialog.open}
        onClose={() => setBulkDialog({ open: false, action: '' })}
      >
        <DialogTitle>
          Confirm Bulk Action
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {bulkDialog.action} {selectedTasks.length} selected task(s)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog({ open: false, action: '' })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleBulkAction(bulkDialog.action)}
            variant="contained"
            color={bulkDialog.action === 'delete' ? 'error' : 'primary'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const App = () => {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
};

export default App;

