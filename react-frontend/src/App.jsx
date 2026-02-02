import { useState, useEffect } from 'react'
import './App.css'
import { getUsers, getUserById, getTasks, getStats, checkHealth } from './services/api'
import UserList from './components/UserList'
import TaskList from './components/TaskList'
import Stats from './components/Stats'
import HealthStatus from './components/HealthStatus'

function App() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [taskFilter, setTaskFilter] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Check health first
      const healthData = await checkHealth()
      setHealth(healthData)

      // Load data in parallel
      const [usersData, tasksData, statsData] = await Promise.all([
        getUsers(),
        getTasks(),
        getStats()
      ])

      setUsers(usersData.users || [])
      setTasks(tasksData.tasks || [])
      setStats(statsData)
    } catch (err) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = async (userId) => {
    setSelectedUserId(userId)
    setLoading(true)
    setError(null)
    try {
      const user = await getUserById(userId)
      setSelectedUser(user)
      // Also filter tasks for this user
      const userTasks = await getTasks('', userId.toString())
      setTasks(userTasks.tasks || [])
    } catch (err) {
      setError(err.message || 'Failed to load user details')
      console.error('Error loading user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskFilter = async (status) => {
    setTaskFilter(status)
    setLoading(true)
    setError(null)
    try {
      const tasksData = await getTasks(status, '')
      setTasks(tasksData.tasks || [])
    } catch (err) {
      setError(err.message || 'Failed to filter tasks')
      console.error('Error filtering tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setSelectedUserId(null)
    setSelectedUser(null)
    setTaskFilter('')
    loadInitialData()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Python Developer Test Project</h1>
        <p>React Frontend → Node.js Backend → Python Backend</p>
      </header>

      <HealthStatus health={health} />

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      )}

      <div className="main-content">
        <div className="stats-section">
          {stats && <Stats stats={stats} />}
        </div>

        <div className="data-section">
          <div className="panel">
            <h2>Users</h2>
            {loading && !users.length ? (
              <div className="loading">Loading users...</div>
            ) : (
              <UserList
                users={users}
                selectedUserId={selectedUserId}
                onUserSelect={handleUserSelect}
              />
            )}
            {selectedUser && (
              <div className="user-details">
                <h3>Selected User Details</h3>
                <div className="detail-card">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Tasks</h2>
              <div className="filter-buttons">
                <button
                  className={taskFilter === '' ? 'active' : ''}
                  onClick={() => handleTaskFilter('')}
                >
                  All
                </button>
                <button
                  className={taskFilter === 'pending' ? 'active' : ''}
                  onClick={() => handleTaskFilter('pending')}
                >
                  Pending
                </button>
                <button
                  className={taskFilter === 'in-progress' ? 'active' : ''}
                  onClick={() => handleTaskFilter('in-progress')}
                >
                  In Progress
                </button>
                <button
                  className={taskFilter === 'completed' ? 'active' : ''}
                  onClick={() => handleTaskFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
            {loading && !tasks.length ? (
              <div className="loading">Loading tasks...</div>
            ) : (
              <TaskList tasks={tasks} />
            )}
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <button onClick={handleRefresh} className="refresh-btn">
          🔄 Refresh All Data
        </button>
      </footer>
    </div>
  )
}

export default App
