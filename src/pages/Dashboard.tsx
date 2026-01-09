import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

type Priority = 1 | 2 | 3 | 4 | 5
type TaskType = { id: string; title: string; projectId: string; deadline: string; priority: Priority; completed: boolean }

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

export default function Dashboard() {
  const { projects, tasks, getTodayTasks, updateTask, getProject, setSelectedTaskId } = useApp()

  const todayTasks = getTodayTasks()

  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date(todayStr + 'T00:00:00')

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + 7)
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0]

  const overdueTasks = tasks.filter((t) => {
    return t.deadline < todayStr && !t.completed
  })

  const thisWeekTasks = tasks.filter((t) => {
    return t.deadline > todayStr && t.deadline <= endOfWeekStr && !t.completed
  })

  const highPriorityTasks = tasks.filter(
    (t) => t.priority <= 2 && !t.completed
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to Test Flight</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/projects" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-gray-400">Projects</div>
        </Link>
        <Link to="/tasks?filter=today" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
          <div className="text-2xl font-bold text-white">{todayTasks.length}</div>
          <div className="text-gray-400">Due Today</div>
        </Link>
        <Link to="/tasks?filter=week" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
          <div className="text-2xl font-bold text-blue-400">{thisWeekTasks.length}</div>
          <div className="text-gray-400">Due This Week</div>
        </Link>
        <Link to="/tasks?filter=overdue" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
          <div className="text-2xl font-bold text-red-400">{overdueTasks.length}</div>
          <div className="text-gray-400">Overdue</div>
        </Link>
      </div>

      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-red-400 mb-4">Overdue Tasks</h2>
          <div className="space-y-2">
            {overdueTasks.map((task) => {
              const project = getProject(task.projectId)
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
                    <div className="text-sm text-gray-400">
                      {project?.name} • Due {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Due Today</h2>
        {todayTasks.length === 0 ? (
          <p className="text-gray-500">No tasks due today</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => {
              const project = getProject(task.projectId)
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
                    <div className="text-sm text-gray-400">{project?.name}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {thisWeekTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Due This Week</h2>
          <div className="space-y-2">
            {thisWeekTasks.map((task) => {
              const project = getProject(task.projectId)
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
                    <div className="text-sm text-gray-400">
                      {project?.name} • {new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {highPriorityTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-orange-400 mb-4">High Priority Tasks</h2>
          <div className="space-y-2">
            {highPriorityTasks.slice(0, 5).map((task) => {
              const project = getProject(task.projectId)
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
                    <div className="text-sm text-gray-400">
                      {project?.name} • Due {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs text-white ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <Link
            to="/projects"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View all →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No projects yet</p>
            <Link
              to="/projects"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id)
              const completedTasks = projectTasks.filter((t) => t.completed)
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="text-white font-medium">{project.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {completedTasks.length}/{projectTasks.length} tasks completed
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
