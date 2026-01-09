import { useState, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProjectChat from '../components/ProjectChat'

type Priority = 1 | 2 | 3 | 4 | 5

interface ProjectFile {
  id: string
  name: string
  type: string
  size: number
  data: string
  uploadedAt: string
}

const priorityLabels: Record<Priority, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Minor',
}

const priorityColors: Record<Priority, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-gray-500',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📄'
  if (type.includes('image')) return '🖼️'
  if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
  if (type.includes('presentation') || type.includes('powerpoint')) return '📽️'
  if (type.includes('document') || type.includes('word')) return '📝'
  return '📎'
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    getProject,
    getProjectTasks,
    addTask,
    updateTask,
    deleteTask,
    addFileToProject,
    removeFileFromProject,
    setSelectedTaskId,
  } = useApp()

  const project = getProject(id!)
  const tasks = getProjectTasks(id!)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPriority, setTaskPriority] = useState<Priority>(3)
  const [taskDeadline, setTaskDeadline] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [activeTab, setActiveTab] = useState<'tasks' | 'files' | 'chat'>('tasks')

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return
    addTask(
      project.id,
      taskTitle.trim(),
      taskDeadline,
      taskPriority,
      taskDescription.trim() || undefined
    )
    setTaskTitle('')
    setTaskDescription('')
    setTaskPriority(3)
    setTaskDeadline(new Date().toISOString().split('T')[0])
    setShowTaskForm(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Max size is 5MB.`)
        continue
      }

      const reader = new FileReader()
      reader.onload = () => {
        const projectFile: ProjectFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        }
        addFileToProject(project.id, projectFile)
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadFile = (file: ProjectFile) => {
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-gray-400 mt-1">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'files'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Files ({project.files.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Chat
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Task
          </button>

          {showTaskForm && (
            <form
              onSubmit={handleAddTask}
              className="bg-gray-800 rounded-lg p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(Number(e.target.value) as Priority)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Critical</option>
                    <option value={2}>2 - High</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - Low</option>
                    <option value={5}>5 - Minor</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Pending ({pendingTasks.length})
              </h2>
              <div className="space-y-2">
                {pendingTasks
                  .sort((a, b) => a.priority - b.priority)
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="bg-gray-800 rounded-lg p-4 flex items-start gap-4 group cursor-pointer hover:bg-gray-750 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          updateTask(task.id, { completed: !task.completed })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{task.title}</div>
                        {task.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="text-sm text-gray-500 mt-2">
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-400 mb-3">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-4 group cursor-pointer hover:bg-gray-800/70 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        updateTask(task.id, { completed: !task.completed })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-gray-400 line-through">{task.title}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                      }}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && !showTaskForm && (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-white mb-2">No tasks yet</h2>
              <p className="text-gray-400">Add your first task to get started</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="space-y-6">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              multiple
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              + Upload Files
            </label>
            <span className="text-gray-400 text-sm ml-3">Max 5MB per file</span>
          </div>

          {project.files.length > 0 ? (
            <div className="space-y-2">
              {project.files.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 group"
                >
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {formatFileSize(file.size)} •{' '}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Remove this file?')) {
                        removeFileFromProject(project.id, file.id)
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-xl font-semibold text-white mb-2">No files yet</h2>
              <p className="text-gray-400">
                Upload files like financials, decks, or legal documents
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <ProjectChat projectId={project.id} />
      )}
    </div>
  )
}
