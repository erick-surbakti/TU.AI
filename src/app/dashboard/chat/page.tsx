"use client"

import * as React from "react"
import { MessageSquare, Send, Loader2, User, Bot, Sparkles, ThermometerSun, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { chatAdvisor } from "@/ai/flows/chat-advisor-flow"
import { createClient } from "@/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatAdvisorPage() {
  const fallbackKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: "Hello Farmer! I'm your TUAI Copilot. How can I help you with your crops today?" }
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [groqKey, setGroqKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")
  const [user, setUser] = React.useState<any>(null)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const supabase = createClient()

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single()
        if (profile?.geminiApiKey) setGroqKey(profile.geminiApiKey)
        if (profile?.countryCode) setCountryCode(profile.countryCode)
      }
    }
    init()
  }, [])

  const activeKey = groqKey || fallbackKey

  const handleSend = async () => {
    const userMsg = input.trim()
    setInput("")

    if (!activeKey) {
      setMessages(prev => [...prev, { role: "user", content: userMsg }])
      setMessages(prev => [...prev, { role: "assistant", content: "The AI service is currently unavailable. Please try again later." }])
      return
    }

    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setIsLoading(true)

    try {
      const response = await chatAdvisor({ userQuestion: userMsg, apiKey: activeKey, countryCode: countryCode })
      setMessages(prev => [...prev, { role: "assistant", content: response.advice }])
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again in a moment." }])
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col max-w-5xl mx-auto rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl bg-white border">
      {/* Header */}
      <div className="p-4 md:p-6 bg-primary text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
            <Bot className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-headline font-bold leading-tight">TUAI Copilot</h2>
            <p className="text-primary-foreground/70 text-[10px] md:text-xs">Powered by your Groq key</p>
          </div>
        </div>
      </div>

      {!activeKey && (
        <div className="p-4 bg-orange-50 border-b border-orange-100">
           <Alert variant="default" className="bg-orange-100 border-none rounded-2xl">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900 font-bold">Bot Offline</AlertTitle>
              <AlertDescription className="text-orange-800 text-xs">
                The AI service is temporarily unavailable. Please try again later.
              </AlertDescription>
           </Alert>
        </div>
      )}

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 md:p-6 bg-accent/5" ref={scrollAreaRef}>
        <div className="space-y-4 md:space-y-6 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-7 w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border text-primary'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-xs md:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-slate-700'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-white border">
                   <Bot className="h-4 w-4 text-primary" />
                 </div>
                 <div className="p-3 md:p-4 rounded-2xl bg-white border rounded-tl-none shadow-sm flex items-center gap-2">
                   <Loader2 className="h-3 w-3 animate-spin text-primary" />
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thinking...</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t bg-white shrink-0">
        <div className="flex gap-2 md:gap-4">
          <Input 
            placeholder={activeKey ? "Ask your question..." : "Bot offline..."}
            value={input}
            disabled={!activeKey}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 border-none shadow-inner text-sm"
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !activeKey}
            className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary text-white shadow-lg active:scale-95 transition-transform"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
