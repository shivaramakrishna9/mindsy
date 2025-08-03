// Backend configuration
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  ASSIGNMENT_ATTACHMENT: (id) => `${BACKEND_URL}/api/assignment/attachment/${id}`,
  SUBMISSION_ATTACHMENT: (assignmentId, studentId) => `${BACKEND_URL}/api/submission/getAttachment/${assignmentId}/${studentId}`,
};

// Helper function to get attachment URLs
export const getAttachmentUrl = (type, ...params) => {
  switch (type) {
    case 'assignment':
      return API_ENDPOINTS.ASSIGNMENT_ATTACHMENT(params[0]);
    case 'submission':
      return API_ENDPOINTS.SUBMISSION_ATTACHMENT(params[0], params[1]);
    default:
      return '';
  }
}; 