import { useSearchParams, Link } from 'react-router-dom'
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

const filterLabels: Record<string, string> = {
  today: 'Due Today',
  week: 'Due This Week',
  overdue: 'Overdue',
  all: 'All Tasks',
}

export default function Tasks() {
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const { tasks, updateTask, getProject, setSelectedTaskId } = useApp()

  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date(todayStr + 'T00:00:00')

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + 7)
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0]

  const filteredTasks = tasks.filter((t) => {
    if (t.completed) return false

    switch (filter) {
      case 'today':
        return t.deadline === todayStr
      case 'week':
        return t.deadline > todayStr && t.deadline <= endOfWeekStr
      case 'overdue':
        return t.deadline < todayStr
      default:
        return true
    }
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {filterLabels[filter] || 'Tasks'}
        </h1>
        <p className="text-gray-400">{sortedTasks.length} tasks</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'today', 'week', 'overdue'].map((f) => (
          <Link
            key={f}
            to={`/tasks?filter=${f}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {filterLabels[f]}
          </Link>
        ))}
      </div>

      {sortedTasks.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-white mb-2">No tasks</h2>
          <p className="text-gray-400">
            {filter === 'all'
              ? 'Create a project and add some tasks'
              : `No ${filterLabels[filter].toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTasks.map((task) => {
            const project = getProject(task.projectId)
            const deadline = new Date(task.deadline)
            const isOverdue = deadline < today

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-750 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => updateTask(task.id, { completed: !task.completed })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{task.title}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Link
                      to={`/projects/${task.projectId}`}
                      className="hover:text-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project?.name}
                    </Link>
                    <span>•</span>
                    <span className={isOverdue ? 'text-red-400' : ''}>
                      {deadline.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
