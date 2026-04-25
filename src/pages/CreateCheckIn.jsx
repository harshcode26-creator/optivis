import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

function CreateCheckIn() {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('WEEKLY');
  const [questions, setQuestions] = useState(['']);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const user = getUserFromToken();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleQuestionChange = (questionIndex, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => (index === questionIndex ? value : question))
    );
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (questionIndex) => {
    setQuestions(questions.filter((_, index) => index !== questionIndex));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await api.post('/checkins/create', {
      title,
      period,
      questions,
    });

    setSuccessMessage('Check-in created successfully');
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div>
      <h1>Create Check-in</h1>

      {successMessage && <p>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
        />

        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="WEEKLY">WEEKLY</option>
          <option value="MONTHLY">MONTHLY</option>
        </select>

        <div>
          {questions.map((question, index) => (
            <div key={index}>
              <input
                type="text"
                value={question}
                onChange={(event) => handleQuestionChange(index, event.target.value)}
                placeholder="Question"
                required
              />
              <button type="button" onClick={() => handleRemoveQuestion(index)}>
                Remove Question
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddQuestion}>
          Add Question
        </button>
        <button type="submit">Create Check-in</button>
      </form>
    </div>
  );
}

export default CreateCheckIn;
