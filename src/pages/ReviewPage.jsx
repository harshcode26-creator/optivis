import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`/assignments/${id}`);

        setAssignment(response.data.assignment);
        setAnswers(response.data.answers || []);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    await api.post('/assignments/review', {
      assignmentId: id,
      adminComment: comment,
    });

    navigate('/dashboard');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Review</h1>
      <p>{assignment?.userId?.name || assignment?.userId?.email}</p>

      <div>
        <h2>Answers</h2>
        {answers.map((answer) => (
          <div key={answer._id || answer.question}>
            <p>{answer.question}</p>
            <p>{answer.answer}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Comment"
          required
        />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReviewPage;
