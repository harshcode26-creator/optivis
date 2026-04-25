import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AdminDashboard() {
  const [insights, setInsights] = useState(null);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [insightsResponse, submittedResponse] = await Promise.all([
          api.get('/assignments/insights'),
          api.get('/assignments/submitted'),
        ]);

        setInsights(insightsResponse.data);
        setSubmittedAssignments(submittedResponse.data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button type="button" onClick={() => navigate('/create-checkin')}>
        Create Check-in
      </button>

      <div>
        <p>Total Assignments: {insights?.totalAssignments ?? 0}</p>
        <p>Submitted Count: {insights?.submittedCount ?? 0}</p>
        <p>Reviewed Count: {insights?.reviewedCount ?? 0}</p>
        <p>Average Sentiment: {insights?.averageSentiment ?? 0}</p>
      </div>

      <div>
        <h2>Blockers</h2>
        {Object.entries(insights?.blockerSummary || {}).map(([blocker, count]) => (
          <p key={blocker}>
            {blocker} - {count}
          </p>
        ))}
      </div>

      {insights?.aiSummary && (
        <div>
          <h2>AI Summary:</h2>
          <p>{insights.aiSummary}</p>
        </div>
      )}

      {insights?.aiSentiment && (
        <div>
          <h2>Sentiment:</h2>
          <p>{insights.aiSentiment}</p>
        </div>
      )}

      <div>
        <h2>Submitted Check-ins</h2>
        {submittedAssignments.length === 0 ? (
          <p>No submitted check-ins.</p>
        ) : (
          submittedAssignments.map((assignment) => (
            <div key={assignment._id || assignment.id}>
              <p>{assignment.userId?.name || assignment.userId?.email}</p>
              <p>{assignment.checkInId?.title}</p>
              <button
                type="button"
                onClick={() => navigate(`/review/${assignment._id || assignment.id}`)}
              >
                Review
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
