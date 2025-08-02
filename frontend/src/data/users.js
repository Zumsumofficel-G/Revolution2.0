// User data for Revolution Roleplay
export const users = [
  {
    id: "admin-001",
    username: "admin",
    password_hash: "admin123", // In real app, this would be hashed
    role: "admin",
    allowed_forms: [],
    created_at: "2025-01-01T00:00:00Z",
    created_by: "system"
  }
];

// Helper functions
export const findUserByCredentials = (username, password) => {
  return users.find(user => 
    user.username === username && user.password_hash === password
  );
};

export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

export const createUser = (userData) => {
  const newUser = {
    id: `user-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...userData
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id, updateData) => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updateData };
    return users[userIndex];
  }
  return null;
};

export const deleteUser = (id) => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
  return null;
};