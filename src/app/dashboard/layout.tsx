import { DashboardShell } from "@/components/dashboard-shell"
import { EasyModeProvider } from "@/components/easy-mode-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EasyModeProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </EasyModeProvider>
  )
}