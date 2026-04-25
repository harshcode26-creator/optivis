const POSITIVE_WORDS = ["done", "completed", "success", "progress"];
const NEGATIVE_WORDS = ["blocked", "issue", "delay", "stuck"];

const getAnswerText = (answer) => {
  if (typeof answer === "string") {
    return answer;
  }

  if (answer && typeof answer.answer === "string") {
    return answer.answer;
  }

  return "";
};

const countMatches = (text, word) => {
  const matches = text.match(new RegExp(`\\b${word}\\b`, "gi"));
  return matches ? matches.length : 0;
};

export const calculateSentimentScore = (answers = []) => {
  if (!Array.isArray(answers)) {
    return 0;
  }

  return answers.reduce((score, answer) => {
    const text = getAnswerText(answer).toLowerCase();

    if (!text) {
      return score;
    }

    const positiveScore = POSITIVE_WORDS.reduce(
      (total, word) => total + countMatches(text, word),
      0
    );

    const negativeScore = NEGATIVE_WORDS.reduce(
      (total, word) => total + countMatches(text, word),
      0
    );

    return score + positiveScore - negativeScore;
  }, 0);
};

export default calculateSentimentScore;
