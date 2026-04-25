const BLOCKER_KEYWORDS = ["block", "blocked", "issue", "delay", "problem", "stuck"];

const getAnswerText = (answer) => {
  if (typeof answer === "string") {
    return answer;
  }

  if (answer && typeof answer.answer === "string") {
    return answer.answer;
  }

  return "";
};

export const detectBlockerKeywords = (answers = []) => {
  if (!Array.isArray(answers)) {
    return [];
  }

  const matchedKeywords = [];

  answers.forEach((answer) => {
    const text = getAnswerText(answer).toLowerCase();

    if (!text) {
      return;
    }

    const matchesInText = BLOCKER_KEYWORDS
      .map((keyword) => {
        const matchIndex = text.search(new RegExp(`\\b${keyword}\\b`, "i"));

        return matchIndex === -1 ? null : { keyword, matchIndex };
      })
      .filter(Boolean)
      .sort((firstMatch, secondMatch) => firstMatch.matchIndex - secondMatch.matchIndex);

    matchesInText.forEach(({ keyword }) => {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    });
  });

  return matchedKeywords;
};

export default detectBlockerKeywords;
