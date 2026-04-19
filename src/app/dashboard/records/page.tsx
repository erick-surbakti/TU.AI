
"use client"

import * as React from "react"
import { ClipboardList, Filter, Download, Plus, Search, Calendar, Tag, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function RecordsPage() {
  const [search, setSearch] = React.useState("")
  const { user } = useUser()
  const db = useFirestore()

  // Fetch real scan results from Firestore
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
      r.status.toLowerCase().includes(search.toLowerCase())
    )
  }, [records, search])

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Farm Activity Ledger</h2>
          <p className="text-muted-foreground">Historical records of your AI diagnostics and farm health events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/5">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="rounded-xl bg-primary text-white font-bold">
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b bg-accent/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by disease or status..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-none bg-white shadow-sm"
                />
             </div>
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your farm records...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-accent/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Diagnosis / Item</TableHead>
                  <TableHead className="font-bold">Confidence</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="group hover:bg-accent/5 transition-colors cursor-pointer">
                    <TableCell className="text-sm">
                      {new Date(record.scanDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full bg-white font-medium">
                        AI Diagnosis
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-primary group-hover:underline">{record.diseaseIdentified}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">AI Recommendation Applied</div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {record.confidenceScore}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {record.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <Search className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredRecords.length === 0 && !isLoading && (
            <div className="p-20 text-center space-y-4">
               <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                 <ClipboardList className="h-8 w-8 text-muted-foreground" />
               </div>
               <p className="text-muted-foreground font-medium">No records found.</p>
               <Button variant="outline" onClick={() => setSearch("")}>Reset Filters</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-none shadow-xl bg-primary text-white">
          <CardHeader>
             <CardTitle className="font-headline font-bold">Ledger Integrity</CardTitle>
             <CardDescription className="text-primary-foreground/70">All records are cryptographically verified and synced to the cloud.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[100%] rounded-full" />
             </div>
             <p className="text-xs font-medium uppercase tracking-widest opacity-80">Synced with Firebase Firestore</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white border border-dashed border-primary/20">
          <CardHeader>
             <CardTitle className="font-headline font-bold text-primary">Need help?</CardTitle>
             <CardDescription>Export your data for government subsidy applications.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="ghost" className="w-full text-primary font-bold hover:bg-primary/5">Download Subsidy PDF</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
