import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

interface ProjectChatProps {
  projectId: string
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
  const { apiKey, getProject, getProjectTasks, addChatMessage, clearChatHistory } = useApp()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const project = getProject(projectId)
  const tasks = getProjectTasks(projectId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [project?.chatHistory])

  if (!project) return null

  const buildSystemPrompt = () => {
    const taskList = tasks.map(t =>
      `- [${t.completed ? 'x' : ' '}] ${t.title} (Priority: ${t.priority}, Due: ${t.deadline})${t.description ? ` - ${t.description}` : ''}`
    ).join('\n')

    const fileList = project.files.map(f => {
      // For text-based files, try to include content
      if (f.type.includes('text') || f.type.includes('json') || f.type.includes('javascript') || f.type.includes('csv')) {
        try {
          const content = atob(f.data.split(',')[1] || '')
          return `### ${f.name}\n\`\`\`\n${content.slice(0, 5000)}${content.length > 5000 ? '\n... (truncated)' : ''}\n\`\`\``
        } catch {
          return `### ${f.name}\n(Binary file, ${f.size} bytes)`
        }
      }
      return `### ${f.name}\n(${f.type}, ${f.size} bytes)`
    }).join('\n\n')

    return `You are an AI assistant helping with the project "${project.name}".
${project.description ? `Project description: ${project.description}` : ''}

## Current Tasks
${taskList || 'No tasks yet.'}

## Project Files
${fileList || 'No files uploaded yet.'}

Help the user with questions about this project, its tasks, and files. Be concise and helpful.`
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    if (!apiKey) {
      setShowSettings(true)
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    addChatMessage(projectId, userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const messages = [
        ...project.chatHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: userMessage.content },
      ]

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: buildSystemPrompt(),
          messages,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'API request failed')
      }

      const data = await response.json()
      const assistantContent = data.content[0]?.text || 'Sorry, I could not generate a response.'

      addChatMessage(projectId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      addChatMessage(projectId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Chat with Claude about this project
        </span>
        <button
          onClick={() => {
            if (confirm('Clear chat history?')) {
              clearChatHistory(projectId)
            }
          }}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          Clear history
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {project.chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">
              Ask questions about your project, tasks, or uploaded files
            </p>
          </div>
        ) : (
          project.chatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        {!apiKey ? (
          <button
            onClick={() => setShowSettings(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
          >
            Set up Claude API key to start chatting
          </button>
        ) : (
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your project..."
              rows={1}
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        )}
      </div>

      {/* Settings prompt */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-800 rounded-lg shadow-2xl z-50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Enter API Key</h3>
            <p className="text-gray-400 text-sm mb-4">
              To use the chat feature, you need to enter your Claude API key. You can get one from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                console.anthropic.com
              </a>
            </p>
            <ApiKeyInput onSave={() => setShowSettings(false)} />
          </div>
        </>
      )}
    </div>
  )
}

function ApiKeyInput({ onSave }: { onSave: () => void }) {
  const { apiKey, setApiKey } = useApp()
  const [key, setKey] = useState(apiKey)

  const handleSave = () => {
    setApiKey(key)
    onSave()
  }

  return (
    <div className="space-y-4">
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="sk-ant-..."
        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium"
        >
          Save
        </button>
        <button
          onClick={onSave}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
