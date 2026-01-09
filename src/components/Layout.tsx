import { NavLink, Outlet } from 'react-router-dom'
import QuickAddTask from './QuickAddTask'
import TaskDetail from './TaskDetail'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const { selectedTaskId, setSelectedTaskId } = useApp()

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="text-xl font-bold text-white">
              Test Flight
            </NavLink>
            <div className="flex gap-6">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/tasks?filter=all"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                Tasks
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <QuickAddTask />
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  )
}
