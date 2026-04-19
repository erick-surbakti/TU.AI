
"use client"

import * as React from "react"
import { ClipboardList, Filter, Download, Plus, Search, Calendar, Tag, CheckCircle2, Loader2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function RecordsPage() {
  const [search, setSearch] = React.useState("")
  const [mounted, setMounted] = React.useState(false)
  const { user } = useUser()
  const db = useFirestore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const scansQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "cropScanResults"),
      orderBy("scanDate", "desc")
    )
  }, [db, user])

  const { data: records, isLoading } = useCollection(scansQuery)

  const filteredRecords = React.useMemo(() => {
    if (!records) return []
    return records.filter(r => 
      r.diseaseIdentified.toLowerCase().includes(search.toLowerCase()) || 
      (r.status && r.status.toLowerCase().includes(search.toLowerCase()))
    )
  }, [records, search])

  const formatDate = (dateStr: string) => {
    if (!mounted) return ""
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary">Farm Activity Ledger</h2>
          <p className="text-xs md:text-sm text-muted-foreground italic mt-1 font-medium">Historical records of your AI diagnostics and farm health.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 md:flex-none rounded-xl border-primary text-primary h-12 text-xs font-bold">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="flex-1 md:flex-none rounded-xl bg-primary text-white h-12 text-xs font-bold">
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/50 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter records..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-none bg-white shadow-inner h-11 text-sm"
                />
             </div>
             <Button variant="ghost" size="sm" className="w-fit rounded-lg text-muted-foreground text-[10px] font-black uppercase tracking-widest">
               <Filter className="mr-2 h-3.5 w-3.5" /> Advanced Filters
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Syncing Records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest min-w-[120px]">Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Diagnosis</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest hidden sm:table-cell text-center">Confidence</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="group hover:bg-primary/5 transition-colors cursor-pointer border-b last:border-0">
                      <TableCell className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                        {formatDate(record.scanDate)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">{record.diseaseIdentified}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1 uppercase font-black tracking-tighter">AI Analysis System</div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="outline" className="rounded-full bg-white text-[10px] font-bold border-primary/20 text-primary">
                          {record.confidenceScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                          <CheckCircle2 className="h-3 w-3" />
                          {record.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-xl group-hover:bg-white group-hover:shadow-md">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {filteredRecords.length === 0 && !isLoading && (
            <div className="py-20 text-center space-y-4 px-6">
               <div className="h-16 w-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                 <ClipboardList className="h-8 w-8 text-slate-300" />
               </div>
               <p className="text-slate-400 font-bold text-sm">No historical records found.</p>
               <Button variant="outline" size="sm" onClick={() => setSearch("")} className="rounded-xl h-11 px-8 font-bold text-xs border-primary text-primary">Reset Search</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-white p-6 md:p-8">
          <CardHeader className="p-0 mb-4">
             <CardTitle className="font-headline font-bold text-xl md:text-2xl">Ledger Integrity</CardTitle>
             <CardDescription className="text-primary-foreground/70 text-sm font-medium">Secure records synced with Firebase Cloud.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
             <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-white w-full rounded-full animate-in slide-in-from-left duration-1000" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">100% Security Verified</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white border border-dashed border-primary/20 p-6 md:p-8 flex flex-col justify-center">
          <CardHeader className="p-0 mb-4">
             <CardTitle className="font-headline font-bold text-lg md:text-xl text-primary">Subsidy Assistance</CardTitle>
             <CardDescription className="text-slate-500 text-xs md:text-sm font-medium">Export activity log for your government grant applications.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <Button variant="outline" className="w-full text-primary font-black text-xs md:text-sm h-14 rounded-2xl border-primary/20 hover:bg-primary/5 shadow-sm">
               DOWNLOAD SUBSIDY PDF
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
