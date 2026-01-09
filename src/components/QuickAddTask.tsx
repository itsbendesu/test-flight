import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

type Priority = 1 | 2 | 3 | 4 | 5

export default function QuickAddTask() {
  const { projects, addTask } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState<Priority>(3)
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return

    addTask(projectId, title.trim(), deadline, priority)
    setTitle('')
    setPriority(3)
    setDeadline(new Date().toISOString().split('T')[0])
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setIsOpen(false)
      setTitle('')
      setPriority(3)
      setDeadline(new Date().toISOString().split('T')[0])
    }, 200)
  }

  return (
    <>
      <button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-3xl font-light z-50 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        title={isOpen ? 'Close' : 'Add task'}
      >
        +
      </button>

      {isOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-200 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />
          <div
            className={`fixed bottom-24 right-6 w-80 bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden transition-all duration-200 ${
              isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Quick Add Task</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm">Create a project first to add tasks</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value) as Priority)}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Critical</option>
                      <option value={2}>High</option>
                      <option value={3}>Medium</option>
                      <option value={4}>Low</option>
                      <option value={5}>Minor</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!title.trim() || !projectId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Add Task
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </>
  )
}
