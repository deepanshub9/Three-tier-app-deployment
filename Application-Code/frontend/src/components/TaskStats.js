import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const TaskStats = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const priorityColors = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50',
  };

  const categoryIcons = {
    work: '💼',
    personal: '👤',
    shopping: '🛒',
    health: '🏥',
    education: '📚',
    other: '📝',
  };

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
          color="primary"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
          color="success"
          subtitle={`${completionRate.toFixed(1)}% completion rate`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<PendingIcon sx={{ fontSize: 40 }} />}
          color="info"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={<WarningIcon sx={{ fontSize: 40 }} />}
          color="error"
        />
      </Grid>

      {/* Progress Bar */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overall Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary">
                {completionRate.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Priority Breakdown */}
      {stats.priorityBreakdown && stats.priorityBreakdown.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stats.priorityBreakdown.map((item) => (
                  <Box
                    key={item._id}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: priorityColors[item._id] || '#757575',
                        }}
                      />
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {item._id}
                      </Typography>
                    </Box>
                    <Chip
                      label={item.count}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Category Breakdown */}
      {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stats.categoryBreakdown.map((item) => (
                  <Box
                    key={item._id}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{categoryIcons[item._id] || '📝'}</span>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {item._id}
                      </Typography>
                    </Box>
                    <Chip
                      label={item.count}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default TaskStats;
