import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { sanitizeHtml } from '../utils/sanitize';

const TaskItem = ({ task, onUpdate, onDelete }) => {

  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editData, setEditData] = useState({
    task: task.task,
    description: task.description || '',
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
  });

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

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || '#757575';
  };

  const getCategoryIcon = (category) => {
    return categories.find(c => c.value === category)?.icon || '📝';
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    
    // Simple date comparison
    const today = new Date().toDateString();
    const dueDateStr = date.toDateString();
    
    if (dueDateStr === today) return { status: 'today', color: '#ff9800' };
    if (date < now) return { status: 'overdue', color: '#f44336' };
    if (date > now) return { status: 'upcoming', color: '#4caf50' };
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const handleEditSave = () => {
    onUpdate(task._id, editData);
    setEditDialog(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(task._id);
    setDeleteDialog(false);
  };



  const dueDateStatus = getDueDateStatus(task.dueDate);

  return (
    <>
      <Card 
        sx={{ 
          mb: 2, 
          opacity: task.completed ? 0.8 : 1,
          border: task.completed ? '1px solid #e0e0e0' : '1px solid transparent',
          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
          transition: 'all 0.3s ease',
          background: task.completed ? 'rgba(0,0,0,0.02)' : 'background.paper',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: (theme) => theme.shadows[8],
            borderColor: getPriorityColor(task.priority)
          }
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary',
                    wordBreak: 'break-word',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    pr: 2
                  }}
                >
                  {task.task}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Tooltip title={`Priority: ${task.priority}`}>
                    <FlagIcon 
                      sx={{ 
                        color: getPriorityColor(task.priority),
                        fontSize: 18
                      }} 
                    />
                  </Tooltip>
                  
                  <IconButton
                    onClick={() => setEditDialog(true)}
                    size="small"
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => setDeleteDialog(true)}
                    size="small"
                    sx={{ 
                      color: 'error.main',
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                        backgroundColor: 'error.light',
                        color: 'white'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={getCategoryIcon(task.category) + ' ' + categories.find(c => c.value === task.category)?.label}
                  size="small"
                  variant="filled"
                  sx={{ 
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    fontWeight: 500
                  }}
                />

                {task.dueDate && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={formatDate(task.dueDate)}
                    size="small"
                    variant="filled"
                    color={dueDateStatus?.status === 'overdue' ? 'error' : 
                           dueDateStatus?.status === 'today' ? 'warning' : 'success'}
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>

              {task.tags && task.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {task.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 22,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}
                    />
                  ))}
                </Box>
              )}

              {task.description && (
                <>
                  <IconButton
                    onClick={() => setExpanded(!expanded)}
                    size="small"
                    sx={{ p: 1, mb: 1 }}
                  >
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <Collapse in={expanded}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        pl: 1,
                        borderLeft: '3px solid',
                        borderColor: 'divider',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {/* Sanitize task description to prevent XSS */}
                      {sanitizeHtml(task.description)}
                    </Typography>
                  </Collapse>
                </>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(task.createdAt)}
                </Typography>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Updated: {formatDate(task.updatedAt)}
                  </Typography>
                )}
              </Box>
        </CardContent>
      </Card>



      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={editData.task}
              onChange={(e) => setEditData(prev => ({ ...prev, task: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editData.priority}
                  label="Priority"
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editData.category}
                  label="Category"
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={editData.dueDate ? (typeof editData.dueDate === 'string' ? editData.dueDate.split('T')[0] : editData.dueDate.toISOString().split('T')[0]) : ''}
              onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value || null }))}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{task.task}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskItem;
