import { useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)

  function handleVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert('Voice input is not supported in this browser.')
    return
  }

  const recognition = new SpeechRecognition()

  recognition.lang = 'en-GB'

  recognition.onstart = () => {
    setListening(true)
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    setInput(transcript)
  }

  recognition.onend = () => {
    setListening(false)
  }

  recognition.start()
}

async function handleSend() {
  if (!input.trim()) return

  const userMessage = input

  setInput('')

  setLoading(true)

  setMessages((previousMessages) => [
    ...previousMessages,
    {
      role: 'user',
      content: userMessage
    }
  ])

  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage
      })
    })

    const data = await response.json()

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: 'assistant',
        content: data.reply
      }
    ])

  setLoading(false)

  } catch (error) {
    console.error(error)
  }
}

  return (
    <div className="chat-container">
      <h1>AI Referral Letter Assistant</h1>

    <div>
    {messages.map((message, index) => (
    <div className={message.role} key={index}>{message.content}</div>
    ))}

    {loading && (
  <p>Assistant is thinking...</p>
)}
  </div>  

    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="voice-button" onClick={handleVoice}>
    {listening ? '🔴' : '🎙️'}
      </button>

      <button onClick={handleSend}>Send</button>
    </div>
    </div>
  )
}

export default App
