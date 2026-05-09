import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project } from "@/types";
import { apiClient } from "@/api/client";

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (p: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  setCurrentProject: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(() => {
    try {
      const stored = localStorage.getItem("current_project_id");
      return stored ? { id: stored } as Project : null;
    } catch {
      return null;
    }
  });

  // On mount, re-fetch the stored project from the API to get fresh data
  useEffect(() => {
    const storedId = localStorage.getItem("current_project_id");
    if (!storedId) return;
    apiClient.get<Project>(`/projects/${storedId}`)
      .then(r => setCurrentProjectState(r.data))
      .catch(() => {
        localStorage.removeItem("current_project_id");
        setCurrentProjectState(null);
      });
  }, []);

  const setCurrentProject = (p: Project | null) => {
    setCurrentProjectState(p);
    if (p) localStorage.setItem("current_project_id", p.id);
    else localStorage.removeItem("current_project_id");
  };

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
