import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { sanitizeHtml } from '../utils/sanitize';

const TaskForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    task: '',
    description: '',
    priority: 'medium',
    category: 'other',
    dueDate: null,
    tags: [],
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
  ];

  const categories = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.task.trim()) return;

    // Clean up and sanitize the data before sending
    const cleanData = {
      ...formData,
      task: sanitizeHtml(formData.task.trim()),
      description: sanitizeHtml(formData.description.trim()),
      dueDate: formData.dueDate || null,
      tags: formData.tags.filter(tag => tag.trim() !== '').map(tag => sanitizeHtml(tag.trim()))
    };

    onSubmit(cleanData);
    
    // Reset form
    setFormData({
      task: '',
      description: '',
      priority: 'medium',
      category: 'other',
      dueDate: null,
      tags: [],
    });
    setTagInput('');
    setShowAdvanced(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagAdd = () => {
    const newTag = tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Task
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Title"
              value={formData.task}
              onChange={(e) => handleInputChange('task', e.target.value)}
              required
              placeholder="What needs to be done?"
              variant="outlined"
              error={formData.task.trim() === '' && formData.task !== ''}
              helperText={formData.task.trim() === '' && formData.task !== '' ? 'Task title is required' : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: priority.color,
                        }}
                      />
                      {priority.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{category.icon}</span>
                      {category.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="small"
                type="button"
              >
                {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                Advanced Options
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={showAdvanced}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Additional details about the task..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value || null)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Add Tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Press Enter to add tag"
                    />
                    <Button
                      variant="outlined"
                      onClick={handleTagAdd}
                      disabled={!tagInput.trim()}
                      type="button"
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>

                {formData.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={`${tag}-${index}`}
                          label={tag}
                          onDelete={() => handleTagDelete(tag)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading || !formData.task.trim()}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? 'Adding Task...' : 'Add Task'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskForm;
