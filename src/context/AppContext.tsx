import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Priority = 1 | 2 | 3 | 4 | 5

export interface Subtask {
  id: string
  title: string
  deadline?: string
  completed: boolean
}

export interface TaskNote {
  id: string
  content: string
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  priority: Priority
  deadline: string
  completed: boolean
  createdAt: string
  subtasks: Subtask[]
  notes: TaskNote[]
}

export interface ProjectFile {
  id: string
  name: string
  type: string
  size: number
  data: string
  uploadedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  files: ProjectFile[]
  chatHistory: ChatMessage[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AppState {
  projects: Project[]
  tasks: Task[]
  apiKey: string
}

interface AppContextType {
  projects: Project[]
  tasks: Task[]
  apiKey: string
  setApiKey: (key: string) => void
  addProject: (name: string, description?: string, color?: string) => Project
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'color'>>) => void
  deleteProject: (id: string) => void
  addFileToProject: (projectId: string, file: ProjectFile) => void
  removeFileFromProject: (projectId: string, fileId: string) => void
  addTask: (projectId: string, title: string, deadline: string, priority: Priority, description?: string) => Task
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline' | 'completed'>>) => void
  deleteTask: (id: string) => void
  getProjectTasks: (projectId: string) => Task[]
  getTodayTasks: () => Task[]
  getProject: (id: string) => Project | undefined
  getTask: (id: string) => Task | undefined
  addSubtask: (taskId: string, title: string, deadline?: string) => void
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Pick<Subtask, 'title' | 'deadline' | 'completed'>>) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  addTaskNote: (taskId: string, content: string) => void
  deleteTaskNote: (taskId: string, noteId: string) => void
  addChatMessage: (projectId: string, message: ChatMessage) => void
  clearChatHistory: (projectId: string) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = 'test-flight-data'

function generateId(): string {
  return crypto.randomUUID()
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const state = JSON.parse(stored)
      // Migrate old projects without chatHistory
      state.projects = state.projects.map((p: Project) => ({
        ...p,
        chatHistory: p.chatHistory || []
      }))
      // Migrate old tasks without subtasks/notes
      state.tasks = state.tasks.map((t: Task) => ({
        ...t,
        subtasks: t.subtasks || [],
        notes: t.notes || []
      }))
      return { ...state, apiKey: state.apiKey || '' }
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
  return { projects: [], tasks: [], apiKey: '' }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [apiKey, setApiKeyState] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    const state = loadState()
    setProjects(state.projects)
    setTasks(state.tasks)
    setApiKeyState(state.apiKey)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      saveState({ projects, tasks, apiKey })
    }
  }, [projects, tasks, apiKey, loaded])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
  }

  const addProject = (name: string, description?: string, color?: string): Project => {
    const project: Project = {
      id: generateId(),
      name,
      description,
      color: color || getRandomColor(),
      files: [],
      chatHistory: [],
      createdAt: new Date().toISOString(),
    }
    setProjects((prev) => [...prev, project])
    return project
  }

  const updateProject = (id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'color'>>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setTasks((prev) => prev.filter((t) => t.projectId !== id))
  }

  const addFileToProject = (projectId: string, file: ProjectFile) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, files: [...p.files, file] } : p
      )
    )
  }

  const removeFileFromProject = (projectId: string, fileId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, files: p.files.filter((f) => f.id !== fileId) }
          : p
      )
    )
  }

  const addTask = (
    projectId: string,
    title: string,
    deadline: string,
    priority: Priority,
    description?: string
  ): Task => {
    const task: Task = {
      id: generateId(),
      projectId,
      title,
      description,
      priority,
      deadline,
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      notes: [],
    }
    setTasks((prev) => [...prev, task])
    return task
  }

  const updateTask = (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline' | 'completed'>>
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const getProjectTasks = (projectId: string): Task[] => {
    return tasks.filter((t) => t.projectId === projectId)
  }

  const getTodayTasks = (): Task[] => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter((t) => t.deadline.split('T')[0] === today && !t.completed)
  }

  const getProject = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id)
  }

  const getTask = (id: string): Task | undefined => {
    return tasks.find((t) => t.id === id)
  }

  const addSubtask = (taskId: string, title: string, deadline?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: generateId(), title, deadline, completed: false },
              ],
            }
          : t
      )
    )
  }

  const updateSubtask = (
    taskId: string,
    subtaskId: string,
    updates: Partial<Pick<Subtask, 'title' | 'deadline' | 'completed'>>
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, ...updates } : s
              ),
            }
          : t
      )
    )
  }

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
          : t
      )
    )
  }

  const addTaskNote = (taskId: string, content: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              notes: [
                ...t.notes,
                { id: generateId(), content, createdAt: new Date().toISOString() },
              ],
            }
          : t
      )
    )
  }

  const deleteTaskNote = (taskId: string, noteId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) }
          : t
      )
    )
  }

  const addChatMessage = (projectId: string, message: ChatMessage) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, chatHistory: [...p.chatHistory, message] }
          : p
      )
    )
  }

  const clearChatHistory = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, chatHistory: [] } : p
      )
    )
  }

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        apiKey,
        setApiKey,
        addProject,
        updateProject,
        deleteProject,
        addFileToProject,
        removeFileFromProject,
        addTask,
        updateTask,
        deleteTask,
        getProjectTasks,
        getTodayTasks,
        getProject,
        getTask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        addTaskNote,
        deleteTaskNote,
        addChatMessage,
        clearChatHistory,
        selectedTaskId,
        setSelectedTaskId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
