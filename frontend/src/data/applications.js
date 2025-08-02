// Application forms data for Revolution Roleplay
export const applicationForms = [
  {
    id: "form-001",
    title: "Staff Ansøgning",
    description: "Ansøg som moderator på Revolution RP",
    position: "Moderator",
    fields: [
      {
        id: "field-1",
        label: "Dit fulde navn",
        field_type: "text",
        required: true,
        placeholder: "Indtast dit fulde navn"
      },
      {
        id: "field-2", 
        label: "Din alder",
        field_type: "text",
        required: true,
        placeholder: "Hvor gammel er du?"
      },
      {
        id: "field-3",
        label: "Hvorfor ønsker du at blive staff?",
        field_type: "textarea",
        required: true,
        placeholder: "Beskriv dine motivationer..."
      }
    ],
    webhook_url: "",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    created_by: "admin"
  },
  {
    id: "form-002",
    title: "Staff Ansøgning Test",
    description: "Test ansøgning for staff rolle",
    position: "Staff",
    fields: [
      {
        id: "field-4",
        label: "Brugernavn",
        field_type: "text", 
        required: true,
        placeholder: "Dit Discord brugernavn"
      },
      {
        id: "field-5",
        label: "Erfaring",
        field_type: "select",
        required: true,
        options: ["Ingen", "Lidt", "Meget", "Ekspert"]
      }
    ],
    webhook_url: "",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    created_by: "admin"
  }
];

// Helper functions
export const getActiveApplications = () => {
  return applicationForms.filter(form => form.is_active);
};

export const findApplicationById = (id) => {
  return applicationForms.find(form => form.id === id);
};

export const createApplication = (formData) => {
  const newForm = {
    id: `form-${Date.now()}`,
    created_at: new Date().toISOString(),
    is_active: true,
    ...formData
  };
  applicationForms.push(newForm);
  return newForm;
};

export const updateApplication = (id, updateData) => {
  const formIndex = applicationForms.findIndex(form => form.id === id);
  if (formIndex !== -1) {
    applicationForms[formIndex] = { ...applicationForms[formIndex], ...updateData };
    return applicationForms[formIndex];
  }
  return null;
};

export const deleteApplication = (id) => {
  const formIndex = applicationForms.findIndex(form => form.id === id);
  if (formIndex !== -1) {
    return applicationForms.splice(formIndex, 1)[0];
  }
  return null;
};