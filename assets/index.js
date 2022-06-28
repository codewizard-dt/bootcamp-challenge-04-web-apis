let trivia = []
let asked = []
let userAnswer = null

const Form = document.getElementById('QuestionForm')
const Prompt = document.getElementById('PlayPrompt')
const Question = Form.querySelector('.card')

/**
 * Fetch trivia and update on success
 */
async function getTrivia() {
  try {
    const response = await fetch('https://api.javascript-trivia.com/')
    let { questions } = await response.json()
    trivia = [...questions]
    console.log(trivia)
    handleStartClick()
  } catch (error) {
    console.log(error)
  }
}
getTrivia()

// ASK USER IF THEY WANT TO PLAY

/**
 * Event listener for #StartBtn
 */
function handleStartClick(ev) {
  if (ev) ev.preventDefault()
  Form.style.display = 'block'
  Prompt.style.display = 'none'
  displayNextQuestion()
}
document.getElementById('StartBtn').addEventListener('click', handleStartClick)

// DISPLAY HIGH SCORES


/**
 * Selects a random question that hasn't been answered yet.
 * @returns a question object from trivia array
 */
function getNext() {
  return trivia.splice(Math.floor(Math.random() * trivia.length), 1)[0]
}
/**
 * 
 * @returns currently displayed question
 */
function getCurrent() {
  return asked[asked.length - 1]
}
function checkAnswer(value) {
  if (value) userAnswer = value
  const { correctAnswer } = getCurrent()
  if (userAnswer === correctAnswer) correct()
  else incorrect()
}
function correct() { console.log('correct') }
function incorrect() { console.log('incorrect') }

const text = Question.querySelector('.text')
const choices = Question.querySelector('.choices')
const snippet = Question.querySelector('.snippet')
const answer = Question.querySelector('.answer')
const answerContent = answer.querySelector('.content')

/**
 * Displays next question
 */
function displayNextQuestion() {
  const next = getNext()
  const {
    question,
    codeSnippet,
    answerOptions,
  } = next

  asked.push(next)
  text.textContent = question
  snippet.innerHTML = codeSnippet
  choices.innerHTML = ''
  for (let key of ['A', 'B', 'C', 'D']) {
    if (!answerOptions[key]) continue
    choices.append(getAnswerOption(key, answerOptions[key]))
  }
  answer.classList.add('hidden')
}


/**
 * @returns an `<li>` with a label and content span
 */
function getHtml(key, value) {
  return `<label>${key}</label><span>${renderAnswerText(value)}</span>`
}
function getAnswerOption(key, value) {
  const ele = document.createElement('li')
  ele.innerHTML = getHtml(key, value)
  ele.addEventListener('click', () => {
    resetLiClass()
    ele.classList.add('active')
    checkAnswer(key)
  })
  return ele
}
/**
 * Removes `active` class from all LIs
 */
function resetLiClass() {
  Form.querySelectorAll('li').forEach(li => li.classList.remove('active'))
}

/**
 * Finds `backticks` and wraps them with span.backtick
 * @param {string} text from API
 * @returns string
 */
function renderAnswerText(text) {
  return text.replace(/(`[^`]*`)/g, str => `<span class='backtick'>${str}</span>`)
}

/**
 * Handles submit event
 * @param  ev submit event  
 */
function submit(ev) {
  ev.preventDefault()
  if (!userAnswer) {
    answerContent.innerHTML = 'Select an answer'
    return
  }
  const { answerExplanation, correctAnswer } = getCurrent()
  answerContent.innerHTML = getHtml(correctAnswer, answerExplanation)
  answer.classList.remove('hidden')
}
Form.addEventListener('submit', submit)

function skip(ev) {
  ev.preventDefault()
  displayNextQuestion()
}
Form.querySelector('button.skip').addEventListener('click', skip)

// SHOW RESULT

// SHOW BUTTON TO NEXT QUESTION

