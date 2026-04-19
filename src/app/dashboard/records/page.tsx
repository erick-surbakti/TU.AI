"use client"

import * as React from "react"
import { ClipboardList, Filter, Download, Plus, Search, Calendar, Tag, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const records = [
  { id: "REC-001", date: "2024-03-20", category: "Diagnosis", item: "Blast Disease Detected", location: "Block A", status: "Resolved", notes: "Applied fungicide recommendation from TUAI." },
  { id: "REC-002", date: "2024-03-18", category: "Purchase", item: "NPK Fertilizer (50kg x 10)", location: "Warehouse", status: "Completed", notes: "Purchased from AgriSupply Central." },
  { id: "REC-003", date: "2024-03-15", category: "Planting", item: "Padi Premium Seeds", location: "Block B", status: "Active", notes: "Sowing complete for 2 acres." },
  { id: "REC-004", date: "2024-03-10", category: "Harvest", item: "Grade A Padi", location: "Block C", status: "Finalized", notes: "Yield: 1.2 tons/acre." },
  { id: "REC-005", date: "2024-03-05", category: "Risk Alert", item: "Export Ban Warning", location: "Global", status: "Archived", notes: "India rice ban monitoring." },
]

export default function RecordsPage() {
  const [search, setSearch] = React.useState("")

  const filteredRecords = records.filter(r => 
    r.item.toLowerCase().includes(search.toLowerCase()) || 
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Crop & Farm Records</h2>
          <p className="text-muted-foreground">Digital ledger for all your diagnostic scans, purchases, and harvest logs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/5">
            <Download className="mr-2 h-4 w-4" /> Export CSV
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
                  placeholder="Search records, categories, locations..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-none bg-white shadow-sm"
                />
             </div>
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" /> Date Range
                </Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] font-bold">ID</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Activity/Item</TableHead>
                <TableHead className="font-bold">Location</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="group hover:bg-accent/5 transition-colors cursor-pointer">
                  <TableCell className="font-medium text-xs text-muted-foreground">{record.id}</TableCell>
                  <TableCell className="text-sm">{record.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full bg-white font-medium">
                      {record.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-primary group-hover:underline">{record.item}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{record.notes}</div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {record.location}
                    </div>
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
          {filteredRecords.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                 <ClipboardList className="h-8 w-8 text-muted-foreground" />
               </div>
               <p className="text-muted-foreground font-medium">No records found matching "{search}"</p>
               <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-none shadow-xl bg-primary text-white">
          <CardHeader>
             <CardTitle className="font-headline font-bold">Storage Capacity</CardTitle>
             <CardDescription className="text-primary-foreground/70">You have used 12% of your 5GB cloud storage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[12%] rounded-full" />
             </div>
             <p className="text-xs font-medium">Synced with Ministry of Agriculture portal.</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl bg-white">
          <CardHeader>
             <CardTitle className="font-headline font-bold">Sync Settings</CardTitle>
             <CardDescription>Automate your records management</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
             <div className="text-sm font-medium">Auto-log AI Diagnostic scans</div>
             <Button size="sm" variant="outline" className="rounded-full px-4 border-emerald-500 text-emerald-600">Enabled</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
