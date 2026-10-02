import { useRef, useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [copied, setCopied] = useState(false)
  const [missingInfo, setMissingInfo] = useState([])
  const inputRef = useRef(null)

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

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
    if (!input.trim() || loading) return

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
      const response = await fetch('https://ai-referral-letter-assistant.onrender.com/api/chat', {
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

      setMissingInfo(data.missingInfo || [])
    } catch (error) {
      console.error(error)

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleMissingInfoClick(item) {
    setInput(`Please provide ${item.toLowerCase()}`)

    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })

      inputRef.current?.focus()
    }, 50)
  }

  return (
    <div className="chat-container">
      <h1>ReferralAI</h1>

      <p className="subtitle">
        AI-assisted referral drafting
      </p>

      <p className="safety-indicator">
        AI-assisted drafting • Clinician review required
      </p>

      <p className="privacy-indicator">
        🔒 Use anonymised or pseudonymised patient information only.
        Do not enter names, NHS numbers or other identifying details.
      </p>

      <div>
        {messages.length === 0 && (
          <div className="empty-state">
            <h2>Draft a referral letter</h2>

            <p>
              Provide the clinical information and ReferralAI will help
              structure it into a professional referral letter.
            </p>
          </div>
        )}

        {missingInfo.length > 0 && (
          <div className="missing-info">
            <div className="missing-info-header">
              <div>
                <h3>Missing information</h3>

                <p>
                  A few details are still needed to complete the referral.
                </p>
              </div>
            </div>

            <div className="missing-info-list">
              {missingInfo.map((item, index) => (
                <button
                  className="missing-info-item"
                  key={index}
                  onClick={() => handleMissingInfoClick(item)}
                >
                  <span className="missing-info-icon">○</span>
                  <span>{item}</span>
                  <span className="missing-info-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div className={message.role} key={index}>
            <div>{message.content}</div>

            {message.role === 'assistant' && (
              <button
                className="copy-button"
                onClick={() => handleCopy(message.content)}
              >
                {copied ? '✓ Copied' : '📋 Copy letter'}
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="loading-message">
            <span>Assistant is thinking</span>
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
          placeholder="Describe the referral..."
        />

        <button className="voice-button" onClick={handleVoice}>
          {listening ? '🔴' : '🎙️'}
        </button>

        <button onClick={handleSend} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default App