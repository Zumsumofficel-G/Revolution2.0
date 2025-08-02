// Application submissions data for Revolution Roleplay
export const applicationSubmissions = [
  {
    id: "sub-001",
    form_id: "form-001",
    applicant_name: "Test Bruger",
    responses: {
      "field-1": "Test Bruger Navn",
      "field-2": "25",
      "field-3": "Jeg ønsker at hjælpe communityet og har god erfaring med roleplay."
    },
    submitted_at: "2025-01-15T10:30:00Z",
    status: "pending"
  },
  {
    id: "sub-002", 
    form_id: "form-002",
    applicant_name: "Anders Hansen",
    responses: {
      "field-4": "Anders#1234",
      "field-5": "Meget"
    },
    submitted_at: "2025-01-16T14:20:00Z",
    status: "approved"
  }
];

// Helper functions
export const getSubmissionsByFormId = (formId) => {
  return applicationSubmissions.filter(sub => sub.form_id === formId);
};

export const getSubmissionsByStatus = (status) => {
  return applicationSubmissions.filter(sub => sub.status === status);
};

export const findSubmissionById = (id) => {
  return applicationSubmissions.find(sub => sub.id === id);
};

export const createSubmission = (submissionData) => {
  const newSubmission = {
    id: `sub-${Date.now()}`,
    submitted_at: new Date().toISOString(),
    status: "pending",
    ...submissionData
  };
  applicationSubmissions.push(newSubmission);
  return newSubmission;
};

export const updateSubmissionStatus = (id, status) => {
  const subIndex = applicationSubmissions.findIndex(sub => sub.id === id);
  if (subIndex !== -1) {
    applicationSubmissions[subIndex].status = status;
    return applicationSubmissions[subIndex];
  }
  return null;
};

export const getFilteredSubmissions = (userRole, allowedForms = []) => {
  if (userRole === 'admin') {
    return applicationSubmissions;
  } else if (userRole === 'staff') {
    return applicationSubmissions.filter(sub => allowedForms.includes(sub.form_id));
  }
  return [];
};