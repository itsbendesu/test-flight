import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Projects() {
  const { projects, tasks, addProject, deleteProject } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addProject(name.trim(), description.trim() || undefined)
    setName('')
    setDescription('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + New Project
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Project
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setName('')
                setDescription('')
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !showForm ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-gray-400 mb-6">
            Create your first project to start organizing tasks and files
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id)
            const completedTasks = projectTasks.filter((t) => t.completed)
            const pendingTasks = projectTasks.filter((t) => !t.completed)
            const highPriority = pendingTasks.filter((t) => t.priority <= 2).length

            return (
              <div
                key={project.id}
                className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition-colors group"
              >
                <Link to={`/projects/${project.id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="text-lg font-medium text-white">
                        {project.name}
                      </h3>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      {completedTasks.length}/{projectTasks.length} tasks
                    </span>
                    {highPriority > 0 && (
                      <span className="text-orange-400">
                        {highPriority} high priority
                      </span>
                    )}
                    {project.files.length > 0 && (
                      <span className="text-gray-400">
                        {project.files.length} files
                      </span>
                    )}
                  </div>
                </Link>
                <div className="mt-4 pt-4 border-t border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (confirm('Delete this project and all its tasks?')) {
                        deleteProject(project.id)
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete project
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
