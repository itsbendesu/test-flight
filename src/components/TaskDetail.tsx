import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

type Priority = 1 | 2 | 3 | 4 | 5

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

interface TaskDetailProps {
  taskId: string
  onClose: () => void
}

export default function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const {
    getTask,
    getProject,
    updateTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addTaskNote,
    deleteTaskNote,
  } = useApp()

  const [isVisible, setIsVisible] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [newSubtaskDate, setNewSubtaskDate] = useState('')
  const [newNote, setNewNote] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState<Priority>(3)
  const [editDeadline, setEditDeadline] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCustomDate, setShowCustomDate] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const todayButtonRef = useRef<HTMLButtonElement>(null)

  const task = getTask(taskId)
  const project = task ? getProject(task.projectId) : undefined

  useEffect(() => {
    setIsVisible(true)
    if (task) {
      setEditTitle(task.title)
      setEditPriority(task.priority)
      setEditDeadline(task.deadline)
    }
  }, [task])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    addSubtask(taskId, newSubtask.trim(), newSubtaskDate || undefined)
    setNewSubtask('')
    setNewSubtaskDate('')
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addTaskNote(taskId, newNote.trim())
    setNewNote('')
  }

  const getToday = () => new Date().toISOString().split('T')[0]

  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      setShowDatePicker(true)
      setShowCustomDate(false)
      setTimeout(() => todayButtonRef.current?.focus(), 0)
    }
  }

  const handleDateSelect = (date: string) => {
    setEditDeadline(date)
    setShowDatePicker(false)
    setShowCustomDate(false)
  }

  const handleSaveEdit = () => {
    updateTask(taskId, {
      title: editTitle,
      priority: editPriority,
      deadline: editDeadline,
    })
    setIsEditing(false)
    setShowDatePicker(false)
    setShowCustomDate(false)
  }

  if (!task) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="relative">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full bg-gray-700 text-white text-lg font-semibold rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-700 rounded-lg p-2 shadow-lg z-10 min-w-[200px]">
                    <div className="flex gap-2 mb-2">
                      <button
                        ref={todayButtonRef}
                        onClick={() => handleDateSelect(getToday())}
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-blue-600 text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => handleDateSelect(getTomorrow())}
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-blue-600 text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Tomorrow
                      </button>
                    </div>
                    {!showCustomDate ? (
                      <button
                        onClick={() => setShowCustomDate(true)}
                        className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Custom date...
                      </button>
                    ) : (
                      <input
                        type="date"
                        value={editDeadline}
                        onChange={(e) => handleDateSelect(e.target.value)}
                        className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <h2
                className="text-lg font-semibold text-white cursor-pointer hover:text-gray-300"
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </h2>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project?.color }}
              />
              <span>{project?.name}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Task Details */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-white">
                  {new Date(task.deadline).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              {isEditing ? (
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(Number(e.target.value) as Priority)}
                  className="bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Critical</option>
                  <option value={2}>High</option>
                  <option value={3}>Medium</option>
                  <option value={4}>Low</option>
                  <option value={5}>Minor</option>
                </select>
              ) : (
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <button
                onClick={() => updateTask(taskId, { completed: !task.completed })}
                className={`px-2 py-1 rounded text-xs ${
                  task.completed
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {task.completed ? 'Completed' : 'Pending'}
              </button>
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setShowDatePicker(false)
                  setShowCustomDate(false)
                  setEditTitle(task.title)
                  setEditPriority(task.priority)
                  setEditDeadline(task.deadline)
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Subtasks */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Subtasks ({task.subtasks.length})
            </h3>

            <div className="space-y-2 mb-3">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 bg-gray-700/50 rounded p-2 group"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() =>
                      updateSubtask(taskId, subtask.id, {
                        completed: !subtask.completed,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed ? 'text-gray-500 line-through' : 'text-white'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  {subtask.deadline && (
                    <span className="text-xs text-gray-500">
                      {new Date(subtask.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <button
                    onClick={() => deleteSubtask(taskId, subtask.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add subtask..."
                className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newSubtaskDate}
                onChange={(e) => setNewSubtaskDate(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Notes ({task.notes.length})
            </h3>

            <div className="space-y-2 mb-3">
              {task.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-700/50 rounded p-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <button
                      onClick={() => deleteTaskNote(taskId, note.id)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
