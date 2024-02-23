const questions = require('../questions/questions.json')

const getCorrectAnswer = (topic, id) => {
  const question = questions[topic].find((question) => question.id === id)

  if (!question.hasOptions) {
    return question.answer
  }

  return question.options.find((option) => option.isCorrect).text
}

module.exports = { getCorrectAnswer }
