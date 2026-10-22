
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('Applied')
  const [location, setLocation] = useState('')
  const [applications, setApplications] = useState([])
  const [editingId, setEditingId] = useState(null)

  // SEARCH AND FILTER STATE
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // SORTING STATE
  const [sortBy, setSortBy] = useState('company')
  const [sortOrder, setSortOrder] = useState('asc')

  // DASHBOARD STATISTICS
  const totalApplications = applications.length

  const totalInterviews = applications.filter(
    application => application.status === 'Interview'
  ).length

  const totalOffers = applications.filter(
    application => application.status === 'Offer'
  ).length

  const totalRejected = applications.filter(
    application => application.status === 'Rejected'
  ).length

  // SEARCH AND FILTER
  const filteredApplications = applications.filter(application => {
    const matchesSearch =
      application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || application.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // SORT APPLICATIONS
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const valueA = a[sortBy].toLowerCase()
    const valueB = b[sortBy].toLowerCase()

    if (sortOrder === 'asc') {
      return valueA.localeCompare(valueB)
    }

    return valueB.localeCompare(valueA)
  })

  // GET: Load applications from PostgreSQL
  useEffect(() => {
    fetch('http://127.0.0.1:8000/applications')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }
        return response.json()
      })
      .then(data => {
        setApplications(data)
      })
      .catch(error => {
        console.error('Error fetching applications:', error)
      })
  }, [])

  // POST or PATCH: Save an application
  async function handleSubmit() {
    if (
      company.trim() === '' ||
      jobTitle.trim() === '' ||
      location.trim() === ''
    ) {
      alert('Please fill in all fields.')
      return
    }

    const applicationData = {
      company: company.trim(),
      role: jobTitle.trim(),
      status: status,
      location: location.trim()
    }

    const isEditing = editingId !== null

    const url = isEditing
      ? `http://127.0.0.1:8000/applications/${editingId}`
      : 'http://127.0.0.1:8000/applications'

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      })

      if (!response.ok) {
        throw new Error('Failed to save application')
      }

      const data = await response.json()

      if (isEditing) {
        setApplications(previous =>
          previous.map(application =>
            application.id === editingId
              ? data.application
              : application
          )
        )
      } else {
        setApplications(previous => [
          ...previous,
          data.application
        ])
      }

      resetForm()

    } catch (error) {
      console.error('Error saving application:', error)
      alert('Failed to save application.')
    }
  }

  // EDIT: Fill the form with existing data
  function handleEdit(application) {
    setEditingId(application.id)
    setCompany(application.company)
    setJobTitle(application.role)
    setStatus(application.status)
    setLocation(application.location)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // RESET FORM
  function resetForm() {
    setCompany('')
    setJobTitle('')
    setStatus('Applied')
    setLocation('')
    setEditingId(null)
  }

  // SORTING FUNCTION
  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(previous =>
        previous === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // DELETE: Remove an application from PostgreSQL
  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/applications/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete application')
      }

      setApplications(previous =>
        previous.filter(application => application.id !== id)
      )

      if (editingId === id) {
        resetForm()
      }

    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Failed to delete application.')
    }
  }

  return (
    <div>
      <h1>Job Application Tracker</h1>
      <p>Manage and track your job applications in one place.</p>

      {/* DASHBOARD */}
      <h2>Dashboard</h2>

      <div className="dashboard">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p>{totalApplications}</p>
        </div>

        <div className="stat-card">
          <h3>Interviews</h3>
          <p>{totalInterviews}</p>
        </div>

        <div className="stat-card">
          <h3>Offers</h3>
          <p>{totalOffers}</p>
        </div>

        <div className="stat-card">
          <h3>Rejected</h3>
          <p>{totalRejected}</p>
        </div>
      </div>

      {/* APPLICATION FORM */}
      <h2>
        {editingId !== null
          ? 'Edit Application'
          : 'Add Application'}
      </h2>

      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}>
        <div>
          <label>Company:</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div>
          <label>Job Title:</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit">
          {editingId !== null
            ? 'Save Changes'
            : 'Add Application'}
        </button>

        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      {/* APPLICATION TABLE */}
      <h2>My Applications</h2>

      {/* SEARCH AND FILTER */}
      <div className="filters">
        <div>
          <label htmlFor="search">Search Applications</label>
          <input
            id="search"
            type="text"
            placeholder="Search company or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="statusFilter">Filter by Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <p>
        Showing {sortedApplications.length} of {totalApplications} applications
      </p>

      <table>
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className="sort-button"
                onClick={() => handleSort('company')}
              >
                Company {sortBy === 'company' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>

            <th>
              <button
                type="button"
                className="sort-button"
                onClick={() => handleSort('role')}
              >
                Job Title {sortBy === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>

            <th>
              <button
                type="button"
                className="sort-button"
                onClick={() => handleSort('status')}
              >
                Status {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>

            <th>
              <button
                type="button"
                className="sort-button"
                onClick={() => handleSort('location')}
              >
                Location {sortBy === 'location' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedApplications.map(application => (
            <tr key={application.id}>
              <td>{application.company}</td>
              <td>{application.role}</td>
              <td>{application.status}</td>
              <td>{application.location}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleEdit(application)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(application.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedApplications.length === 0 && (
        <p>No applications match your search or filter.</p>
      )}
    </div>
  )
}

export default App
