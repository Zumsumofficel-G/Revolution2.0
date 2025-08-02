// Changelogs data for Revolution Roleplay
export const changelogs = [
  {
    id: "changelog-001",
    title: "Server Launch",
    content: "Velkommen til Revolution Roleplay!\n\n• Server er nu live og klar til spil\n• Alle grundlæggende systemer er implementeret\n• Staff team er på plads\n• Discord server er oprettet",
    version: "1.0.0",
    created_at: "2025-01-01T00:00:00Z",
    created_by: "admin"
  },
  {
    id: "changelog-002", 
    title: "Performance Forbedringer",
    content: "Mindre opdateringer og fejlrettelser:\n\n• Forbedret server performance\n• Rettet bugs i job systemet\n• Tilføjet nye køretøjer\n• Optimeret database queries",
    version: "1.0.1",
    created_at: "2025-01-10T12:00:00Z", 
    created_by: "admin"
  },
  {
    id: "changelog-003",
    title: "Nye Features", 
    content: "Store opdateringer til serveren:\n\n• Nyt housing system\n• Forbedret economy\n• Nye jobs tilgængelige\n• Bank system opdateret\n• Bug fixes og stabilitet",
    version: "1.1.0",
    created_at: "2025-01-20T16:30:00Z",
    created_by: "admin"
  }
];

// Helper functions
export const getPublicChangelogs = (limit = 10) => {
  return changelogs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

export const findChangelogById = (id) => {
  return changelogs.find(changelog => changelog.id === id);
};

export const createChangelog = (changelogData) => {
  const newChangelog = {
    id: `changelog-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...changelogData
  };
  changelogs.push(newChangelog);
  return newChangelog;
};

export const updateChangelog = (id, updateData) => {
  const changelogIndex = changelogs.findIndex(changelog => changelog.id === id);
  if (changelogIndex !== -1) {
    changelogs[changelogIndex] = { ...changelogs[changelogIndex], ...updateData };
    return changelogs[changelogIndex];
  }
  return null;
};

export const deleteChangelog = (id) => {
  const changelogIndex = changelogs.findIndex(changelog => changelog.id === id);
  if (changelogIndex !== -1) {
    return changelogs.splice(changelogIndex, 1)[0];
  }
  return null;
};