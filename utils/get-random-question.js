const questions = require('../questions/questions.json')
const { Random } = require('random-js')

const getRandomQuestion = (topic) => {
  const random = new Random()

  let questionTopic = topic.toLowerCase()

  if (questionTopic === 'random') {
    questionTopic =
      Object.keys(questions)[
        random.integer(0, Object.keys(questions).length - 1)
        ]
  }

  const randomQuestionIndex = random.integer(
    0,
    questions[questionTopic].length - 1,
  )

  const question = questions[questionTopic][randomQuestionIndex]

  return {
    question,
    questionTopic,
  }
}

module.exports = { getRandomQuestion }
