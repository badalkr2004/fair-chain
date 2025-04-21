/**
 * Format a date to a readable string (DD MMM, YYYY)
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month}, ${year}`;
};

/**
 * Format a date to a readable string with time (DD MMM, YYYY HH:MM)
 */
export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month}, ${year} ${hours}:${minutes}`;
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTimeString = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  if (diffDays > 0) {
    return diffDays === 1 ? 'in 1 day' : `in ${diffDays} days`;
  } else if (diffDays < 0) {
    return diffDays === -1 ? '1 day ago' : `${Math.abs(diffDays)} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? 'in 1 hour' : `in ${diffHours} hours`;
  } else if (diffHours < 0) {
    return diffHours === -1 ? '1 hour ago' : `${Math.abs(diffHours)} hours ago`;
  } else if (diffMins > 0) {
    return diffMins === 1 ? 'in 1 minute' : `in ${diffMins} minutes`;
  } else if (diffMins < 0) {
    return diffMins === -1 ? '1 minute ago' : `${Math.abs(diffMins)} minutes ago`;
  } else {
    return diffSecs >= 0 ? 'just now' : 'just now';
  }
};
