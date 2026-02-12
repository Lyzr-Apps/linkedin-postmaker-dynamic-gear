'use client'

import { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Loader2 } from 'lucide-react'
import { FiCopy, FiRefreshCw } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

// Theme variables - Editorial Light
const THEME_VARS = {
  '--background': '0 0% 98%',
  '--foreground': '0 0% 8%',
  '--card': '0 0% 100%',
  '--card-foreground': '0 0% 8%',
  '--primary': '0 0% 8%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '0 0% 94%',
  '--secondary-foreground': '0 0% 12%',
  '--accent': '0 80% 45%',
  '--accent-foreground': '0 0% 98%',
  '--muted': '0 0% 92%',
  '--muted-foreground': '0 0% 40%',
  '--border': '0 0% 85%',
  '--input': '0 0% 80%',
  '--ring': '0 0% 8%',
} as React.CSSProperties

interface GeneratedPost {
  post_content: string
  hashtags: string[]
  post_style: string
  character_count: number
}

interface AgentResponse {
  success: boolean
  response?: {
    result: GeneratedPost
  }
  error?: string
}

const AGENT_ID = '698da59525b27d3bfba133d4'
const POST_STYLES = ['General', 'Story', 'Tips', 'Question', 'Announcement']

export default function Home() {
  const [topic, setTopic] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('General')
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Auto-hide copy success message after 2s
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copySuccess])

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    setError(null)
    setGeneratedPost(null)

    try {
      const result = await callAIAgent(
        `Generate a ${selectedStyle} style LinkedIn post about: ${topic}`,
        AGENT_ID
      ) as AgentResponse

      if (result.success && result.response?.result) {
        setGeneratedPost(result.response.result)
      } else {
        setError(result.error || 'Failed to generate post. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedPost?.post_content) return

    try {
      const hashtags = Array.isArray(generatedPost.hashtags)
        ? generatedPost.hashtags.join(' ')
        : ''
      const fullPost = `${generatedPost.post_content}\n\n${hashtags}`

      await navigator.clipboard.writeText(fullPost)
      setCopySuccess(true)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div style={THEME_VARS} className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground mb-3">
            LinkedIn Post Generator
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Craft engaging posts optimized for professional audiences
          </p>
        </header>

        {/* Input Section */}
        <Card className="mb-8 border border-border rounded-none shadow-none">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Topic Input */}
              <div>
                <label
                  htmlFor="topic-input"
                  className="block font-medium text-foreground mb-2"
                >
                  What do you want to post about?
                </label>
                <Textarea
                  id="topic-input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="e.g., The importance of continuous learning in tech careers"
                  className="min-h-[120px] resize-none border-input rounded-none tracking-tight leading-relaxed"
                  maxLength={500}
                  aria-label="Post topic input"
                />
                <div className="text-sm text-muted-foreground mt-1 text-right">
                  {topic.length}/500
                </div>
              </div>

              {/* Style Selector */}
              <div>
                <label className="block font-medium text-foreground mb-3">
                  Post Style
                </label>
                <div className="flex flex-wrap gap-3">
                  {POST_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-5 py-2 border-2 rounded-none tracking-tight transition-all ${
                        selectedStyle === style
                          ? 'border-accent bg-accent text-accent-foreground font-medium'
                          : 'border-border bg-card text-foreground hover:border-foreground'
                      }`}
                      aria-pressed={selectedStyle === style}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() || isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 font-medium tracking-tight"
                aria-label="Generate LinkedIn post"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Post'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-8 p-4 border-2 border-accent bg-accent/5 rounded-none">
            <p className="text-accent text-sm tracking-tight">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {generatedPost ? (
          <Card className="border border-border rounded-none shadow-none">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Post Content */}
                <div>
                  <h2 className="font-medium text-foreground mb-4">
                    Generated Post
                  </h2>
                  <div className="p-6 bg-secondary/50 border border-border rounded-none">
                    <p className="whitespace-pre-wrap leading-relaxed tracking-tight text-foreground">
                      {generatedPost.post_content}
                    </p>
                  </div>
                </div>

                {/* Hashtags */}
                {Array.isArray(generatedPost.hashtags) && generatedPost.hashtags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-foreground mb-3 text-sm">
                      Hashtags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedPost.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-none border border-border tracking-tight"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Character Count */}
                <div className="text-sm text-muted-foreground">
                  Character count: {generatedPost.character_count ?? 0}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex items-center gap-2 rounded-none border-border hover:border-foreground"
                    aria-label="Copy post to clipboard"
                  >
                    <FiCopy className="h-4 w-4" />
                    Copy Post
                  </Button>

                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="flex items-center gap-2 rounded-none border-border hover:border-foreground"
                    disabled={isLoading}
                    aria-label="Regenerate post"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>

                  {/* Copy Success Message */}
                  {copySuccess && (
                    <span className="text-sm text-accent font-medium ml-2">
                      Copied to clipboard!
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !isLoading && !error && (
          /* Empty State */
          <div className="text-center py-16">
            <p className="text-muted-foreground tracking-tight leading-relaxed">
              Enter your topic above to get started
            </p>
          </div>
        )}

        {/* Agent Info */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground tracking-tight">
              Powered by <span className="font-medium text-foreground">LinkedIn Post Generator Agent</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? (
                <span className="text-accent">● Active</span>
              ) : (
                <span>● Ready</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
