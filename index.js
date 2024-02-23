const { Bot, GrammyError, Keyboard, InlineKeyboard, HttpError } = require('grammy')
const config = require('config')
const { getRandomQuestion } = require('./utils/get-random-question')
const { getCorrectAnswer } = require('./utils/get-correct-answer')

const token = config.get("BOT.TOKEN")

const bot = new Bot(`${token}`)

bot.command('start', async (ctx) => {
  const startKeyboard = new Keyboard()
    .text('mongol')
    .text('yakut')
    .row()
    .text('random')
    .resized()
  await ctx.reply(
    'Hello! \nI\'ll help you memorize the necessary translations.',
  )
  await ctx.reply('Choose a language, please', {
    reply_markup: startKeyboard,
  })
})

bot.hears(
  ['mongol', 'yakut', 'random'],
  async (ctx) => {
    const topic = ctx.message.text.toLowerCase()
    const { question, questionTopic } = getRandomQuestion(topic)

    let inlineKeyboard

    if (question.hasOptions) {
      const buttonRows = question.options.map((option) => [
        InlineKeyboard.text(
          option.text,
          JSON.stringify({
            type: `${questionTopic}-option`,
            isCorrect: option.isCorrect,
            questionId: question.id,
          }),
        ),
      ])

      inlineKeyboard = InlineKeyboard.from(buttonRows)
    } else {
      inlineKeyboard = new InlineKeyboard().text(
        'Get answer',
        JSON.stringify({
          type: questionTopic,
          questionId: question.id,
        }),
      )
    }

    await ctx.reply(question.text, {
      reply_markup: inlineKeyboard,
    })
  },
)

bot.on('callback_query:data', async (ctx) => {
  const callbackQueryData = JSON.parse(ctx.callbackQuery.data)

  if (!callbackQueryData.type.includes('option')) {
    const answer = getCorrectAnswer(callbackQueryData.type, callbackQueryData.questionId)
    await ctx.reply(answer, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
    await ctx.answerCallbackQuery()
    return
  }

  if (callbackQueryData.isCorrect) {
    await ctx.reply('Correct ✅')
    await ctx.answerCallbackQuery()
    return
  }

  const answer = getCorrectAnswer(
    callbackQueryData.type.split('-')[0],
    callbackQueryData.questionId,
  )
  await ctx.reply(`Incorrect ❌ The correct answer: ${answer}`)
  await ctx.answerCallbackQuery()
})

bot.catch((err) => {
  const ctx = err.ctx

  console.error(`Error while handling update ${ctx.update.update_id}:`)

  const e = err.error

  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description)
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e)
  } else {
    console.error('Unknown error:', e)
  }
})

bot.start().then(() => console.log('Bot started'))
