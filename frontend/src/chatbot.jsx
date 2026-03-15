import { useState, useEffect, useRef } from "react"
import { MessageCircle, Star } from "lucide-react"
import Logo from "./assets/Logo.png"
import Pfp from "./assets/Pfp.png"
import "./chatbot.css"

const QUICK_QUESTIONS = [
  "What are the upcoming events?",
  "How do I become a member?",
  "What is your vision and mission?",
  "Who are the leads?",
  "How to apply?",
]

const HERO_TEXTS = [
  "Ask Alf Anything ☁️",
  "Tanungin si Alf ✨",
  "Ask Alf Anything 🚀",
  "Pangutan-a si Alf 💜",
]

const API_BASE = "https://alf-ai-backend.onrender.com"

function formatMessage(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const boldRegex = /\*\*(.*?)\*\*/g

  return text.split("\n").map((line, i) => {
    const parts = line.split(urlRegex)
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (urlRegex.test(part)) {
            return (
              <a key={j} href={part} target="_blank" rel="noreferrer" className="msg-link">
                {part}
              </a>
            )
          }
          const boldParts = part.split(boldRegex)
          return boldParts.map((bp, k) =>
            k % 2 === 1 ? <strong key={k} className="msg-bold">{bp}</strong> : bp
          )
        })}
        <br />
      </span>
    )
  })
}

function AnimatedMessage({ text }) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    let i = 0
    setDisplayed("")
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 2))
        i++
      } else {
        clearInterval(interval)
      }
    }, 14)
    return () => clearInterval(interval)
  }, [text])

  return <>{formatMessage(displayed)}</>
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= (hovered || value) ? "star-active" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >★</span>
      ))}
    </div>
  )
}

function HeroTyping() {
  const [textIndex, setTextIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = HERO_TEXTS[textIndex]
    let timeout

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 90)
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 80)
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false)
      setTextIndex(prev => (prev + 1) % HERO_TEXTS.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, textIndex])

  return (
    <h1>
      Cloud Buddies!{" "}
      <span>
        {displayed}
        <span className="cursor" />
      </span>
    </h1>
  )
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey there! Alf here ☁️ Ask me anything about AWS Cloud Club - PUP!" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [chips, setChips] = useState(QUICK_QUESTIONS)
  const [chatStarted, setChatStarted] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [feedback, setFeedback] = useState({ name: "", email: "", rating: 0, message: "" })
  const [feedbackStatus, setFeedbackStatus] = useState("")
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const bottomRef = useRef(null)
  const chipsRef = useRef(null)
  const scrollInterval = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, loading])

  const startScroll = (dir) => {
    scrollInterval.current = setInterval(() => {
      chipsRef.current.scrollLeft += dir === "right" ? 3 : -3
    }, 10)
  }

  const stopScroll = () => clearInterval(scrollInterval.current)

 const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    setChatStarted(true)

    const userMessage = { role: "user", content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }])
    } catch (err) {
      console.error("[sendMessage]", err)
      setMessages([...updatedMessages, {
        role: "assistant",
        content: "Something went wrong with the Cloud connection just now, but don't worry — try again! 💜"
      }])
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async () => {
    if (!feedback.name || !feedback.message || feedback.rating === 0) {
      setFeedbackStatus("error")
      return
    }

    setFeedbackLoading(true)
    setFeedbackStatus("")

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      setFeedbackStatus("success")
      setFeedback({ name: "", email: "", rating: 0, message: "" })
    } catch (err) {
      console.error("[submitFeedback]", err)
      setFeedbackStatus("failed")
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="sidebar">
        <div className="logo-wrap">
          <img src={Logo} alt="AWSCC PUP" style={{ width: 48, height: 48, objectFit: "contain" }} />
        </div>
        <button
          className={`nav-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
          aria-label="Chat"
        >
          <MessageCircle size={20} strokeWidth={1.8} />
          <span className="nav-label">Chat</span>
        </button>
        <button
          className={`nav-btn ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
          aria-label="Review"
        >
          <Star size={20} strokeWidth={1.8} />
          <span className="nav-label">Review</span>
        </button>
      </div>

      <div className="main">
        {activeTab === "chat" && (
          <div className="chat-tab">
            <div className={`chat-hero ${chatStarted ? "chat-hero-hidden" : ""}`}>
              <div className="chat-hero-logo">
                <img src={Logo} alt="Alf" style={{ width: "12rem", height: "12rem", objectFit: "contain" }} />
              </div>
              <HeroTyping />
              <p><span className="online-dot" />AWS Cloud Club PUP · online</p>
            </div>

            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`msg-row ${msg.role === "user" ? "user-row" : ""}`}>
                  <div className={`av ${msg.role === "user" ? "user-av" : "bot-av"}`}>
                    {msg.role === "user"
                      ? "U"
                      : <img src={Pfp} alt="Alf" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    }
                  </div>
                  <div className={`bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                    {msg.role === "assistant" && index === messages.length - 1
                      ? <AnimatedMessage text={msg.content} />
                      : formatMessage(msg.content)
                    }
                  </div>
                </div>
              ))}

              {loading && (
                <div className="typing-wrap">
                  <div className="av bot-av">
                    <img src={Pfp} alt="Alf" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="typing-bubble">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="dot" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {chips.length > 0 && (
              <div className="chips-wrap">
                <div
                  className="scroll-zone scroll-left"
                  onMouseEnter={() => startScroll("left")}
                  onMouseLeave={stopScroll}
                />
                <div ref={chipsRef} className="chip-row">
                  {chips.map(q => (
                    <button key={q} className="chip" onClick={() => { sendMessage(q); setChips([]) }}>
                      {q}
                    </button>
                  ))}
                </div>
                <div
                  className="scroll-zone scroll-right"
                  onMouseEnter={() => startScroll("right")}
                  onMouseLeave={stopScroll}
                />
              </div>
            )}

            <div className="input-row">
              <input
                className="chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask me anything about AWSCC PUP..."
              />
              <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading}>
                {loading ? "..." : "Send "}
              </button>
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="feedback-tab">
            <div className="fb-header">
              <h2>Leave a <span>Review</span></h2>
              <p>Help us improve Alf and AWS Cloud Club PUP by sharing your experience!</p>
            </div>

            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input className="form-input" type="text" placeholder="e.g. Alf Curada"
                value={feedback.name} onChange={e => setFeedback({ ...feedback, name: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Email (optional)</label>
              <input className="form-input" type="email" placeholder="e.g. alf.curada@gmail.com"
                value={feedback.email} onChange={e => setFeedback({ ...feedback, email: e.target.value })} />
            </div>

            <div className="form-group" style={{ textAlign: "center" }}>
              <label className="form-label">Rating *</label>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <StarRating value={feedback.rating} onChange={val => setFeedback({ ...feedback, rating: val })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Feedback *</label>
              <textarea className="form-input"
                placeholder="Tell us what you think about Alf or AWSCC PUP events..."
                value={feedback.message} onChange={e => setFeedback({ ...feedback, message: e.target.value })} />
            </div>

            <button className="submit-btn" onClick={submitFeedback} disabled={feedbackLoading}>
              {feedbackLoading ? "Sending..." : "Submit Feedback "}
            </button>

            {feedbackStatus === "success" && <div className="status-box status-success"> Salamat! Your feedback has been sent successfully!</div>}
            {feedbackStatus === "error"   && <div className="status-box status-error"> Please fill in your name, rating, and feedback before submitting.</div>}
            {feedbackStatus === "failed"  && <div className="status-box status-failed"> Something went wrong. Please try again later.</div>}

            <div className="divider" />
            <p style={{ fontSize: 14, color: "#3b3561", textAlign: "center" }}>Your feedback helps AWSCC PUP grow!</p>
          </div>
        )}
      </div>
    </div>
  )

  
}

