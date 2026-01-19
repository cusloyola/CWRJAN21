import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/ActivityLog.css';

type Activity = {
  id: number;
  date: string;
  description: string;
  status: 'Completed' | 'Pending' | 'In Progress';
};

const activities: Activity[] = [
  { id: 1, date: '2026-01-10', description: 'Reviewed project proposal for Client A.', status: 'Completed' },
  { id: 2, date: '2026-01-12', description: 'Meeting with Client B regarding project requirements.', status: 'Pending' },
  { id: 3, date: '2026-01-14', description: 'Code review and pull request for feature XYZ.', status: 'In Progress' },
  { id: 4, date: '2026-01-15', description: 'Updated database schema for the project management system.', status: 'Completed' },
  { id: 5, date: '2026-01-16', description: 'Prepared sprint backlog for Q1 release.', status: 'Pending' },
  { id: 6, date: '2026-01-17', description: 'Conducted user testing session with internal team.', status: 'In Progress' }, { id: 7, date: '2026-01-18', description: 'Finalized UI mockups for dashboard redesign.', status: 'Completed' },
  { id: 8, date: '2026-01-19', description: 'Security audit on authentication module.', status: 'Pending' },
  { id: 9, date: '2026-01-20', description: 'Integrated payment gateway API.', status: 'In Progress' },
  { id: 10, date: '2026-01-21', description: 'Drafted documentation for onboarding process.', status: 'Completed' },
  { id: 11, date: '2026-01-22', description: 'Team retrospective meeting for sprint 5.', status: 'Completed' },
  { id: 12, date: '2026-01-23', description: 'Bug triage and prioritization for release candidate.', status: 'Pending' },
  { id: 13, date: '2026-01-24', description: 'Optimized database queries for reporting module.', status: 'In Progress' },
  { id: 14, date: '2026-01-25', description: 'Client demo presentation for milestone delivery.', status: 'Completed' },
  { id: 15, date: '2026-01-26', description: 'Implemented role-based access control.', status: 'Pending' },
];

const CFIICWR: React.FC = () => {

  // 1. Add Search State
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Pending' | 'In Progress'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Update Filtering Logic
  const filteredActivities = activities.filter(activity => {
    // Check Status
    const matchesFilter = filter === 'All' || activity.status === filter;

    // Check Search (Case insensitive, checks description, date, or status)
    const matchesSearch =
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.date.includes(searchQuery) ||
      activity.status.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Sidebar />
      <div className="wpsi-content">
        <header className="dashboard-header"></header>

        <main className="wpsi-main">

          <div className="wpsi-inner">

            <div className="wpsi-section-header">
              <h1>CFII - CWR</h1>
            </div>
            {/* 3. Controls Container (Flexbox for side-by-side layout) */}
            <div className="wpsi-controls mb-4"> {/* Added class here */}

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wpsi-search-input" // Added class here
              />

              {/* Filter Dropdown */}
              <div className="wpsi-dropdown-container">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="wpsi-dropdown" // Ensure this class exists
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>

            </div>

            <div className="wpsi-wrapper px-4 sm:px-6">
              <div className="activity-card-container">

                {/* Check if there are items to show */}
                {filteredActivities.length > 0 ? (
                  // If YES: Map through the activities
                  filteredActivities.map((activity) => (
                    <div key={activity.id} className="wpsi-transaction-item">
                      <div className="wpsi-transaction-label">{activity.date}</div>
                      <div className="wpsi-transaction-row">
                        <div>
                          <div className="wpsi-transaction-title">{activity.description}</div>
                          <div className="wpsi-transaction-amount">{activity.status}</div>
                        </div>
                        <svg className="wpsi-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))
                ) : (
                  // If NO: Show the "No Results" div
                  <div className="wpsi-no-results">
                    <p>No results found</p>
                    {searchQuery && <span>No matches for "{searchQuery}" with status "{filter}"</span>}
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>

    </>
  );
};

export default CFIICWR;
