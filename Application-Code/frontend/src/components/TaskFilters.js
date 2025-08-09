import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Typography,
  Grid,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';

const TaskFilters = ({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange 
}) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const statusOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'false', label: 'Pending' },
    { value: 'true', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'task', label: 'Title' },
  ];

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      completed: '',
      priority: '',
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value, index) => {
      const keys = Object.keys(filters);
      return value && keys[index] !== 'sortBy' && keys[index] !== 'sortOrder';
    }
  ).length;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Typography variant="h6">Filters</Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} active`} 
              size="small" 
              color="primary" 
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
            size="small"
          >
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          
          {activeFiltersCount > 0 && (
            <Chip 
              label="Clear All" 
              size="small" 
              variant="outlined" 
              onClick={clearFilters}
              clickable
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Search by title, description, or tags..."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.completed || ''}
              label="Status"
              onChange={(e) => handleFilterChange('completed', e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || ''}
              label="Priority"
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {priority.color && (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: priority.color,
                        }}
                      />
                    )}
                    {priority.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || ''}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.icon && <span>{category.icon}</span>}
                    {category.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy || 'createdAt'}
              label="Sort By"
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder || 'desc'}
              label="Order"
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TaskFilters;
