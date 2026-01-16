import React from 'react';
import Sidebar from './Sidebar';
import '../styles/activityLog.css'; // your dedicated stylesheet

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
];

const WMSICWR: React.FC = () => {
  return (
    <>
      <Sidebar />
      <div className="wpsi-content">
        <main className="wpsi-main">
          <div className="wpsi-inner">

            <div className="wpsi-section-header">
              <h1>WMSI - CWR</h1>
            </div>

            <div className="wpsi-wrapper px-4 sm:px-6">
              <div className="activity-card-container">
                {activities.map((activity) => (
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
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

    </>
  );
};

export default WMSICWR;
