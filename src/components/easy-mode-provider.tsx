"use client"

import * as React from "react"
import { createClient } from "@/supabase/client"

type EasyModeContextType = {
  isEasyMode: boolean;
  ageGroup: string;
  birthDate: string | null;
  toggleEasyMode: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const EasyModeContext = React.createContext<EasyModeContextType | undefined>(undefined)

export function EasyModeProvider({ children }: { children: React.ReactNode }) {
  const [isEasyMode, setIsEasyMode] = React.useState(false)
  const [ageGroup, setAgeGroup] = React.useState("Unknown")
  const [birthDate, setBirthDate] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  const supabase = createClient()

  React.useEffect(() => {
    async function loadPreferences() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) {
          setIsLoading(false)
          return
        }

        const { data: userProfile } = await supabase
          .from('users')
          .select('easy_mode_enabled, age_group, birth_date')
          .eq('id', authData.user.id)
          .single()

        if (userProfile) {
          setIsEasyMode(userProfile.easy_mode_enabled || false)
          setAgeGroup(userProfile.age_group || "Unknown")
          setBirthDate(userProfile.birth_date || null)
        }
      } catch (error) {
        console.error("Failed to fetch easy mode preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const toggleEasyMode = async (enabled: boolean) => {
    setIsEasyMode(enabled)
    const { data: authData } = await supabase.auth.getUser()
    if (authData.user) {
      await supabase.from('users').update({ easy_mode_enabled: enabled }).eq('id', authData.user.id)
    }
  }

  // Inject a global CSS class to the HTML body for seamless global styling
  React.useEffect(() => {
    if (isEasyMode) {
      document.documentElement.classList.add('easy-mode-active')
    } else {
      document.documentElement.classList.remove('easy-mode-active')
    }
  }, [isEasyMode])

  return (
    <EasyModeContext.Provider value={{ isEasyMode, ageGroup, birthDate, toggleEasyMode, isLoading }}>
      {children}
    </EasyModeContext.Provider>
  )
}

export function useEasyMode() {
  const context = React.useContext(EasyModeContext)
  if (context === undefined) {
    throw new Error("useEasyMode must be used within an EasyModeProvider")
  }
  return context
}
