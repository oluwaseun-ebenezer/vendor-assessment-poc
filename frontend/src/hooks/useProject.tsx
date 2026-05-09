import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Project } from "@/types";

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
      const stored = localStorage.getItem("current_project");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setCurrentProject = (p: Project | null) => {
    setCurrentProjectState(p);
    if (p) localStorage.setItem("current_project", JSON.stringify(p));
    else localStorage.removeItem("current_project");
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
