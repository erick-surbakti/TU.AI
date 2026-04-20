"use client"

import * as React from "react"
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Info, History, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { scanCrop, type ScanCropOutput } from "@/ai/flows/scan-crop-flow"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { createClient } from "@/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function DiseaseScanPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [user, setUser] = React.useState<any>(null)
  const [groqKey, setGroqKey] = React.useState<string | null>(null)
  const [scanHistory, setScanHistory] = React.useState<any[]>([])

  const [image, setImage] = React.useState<string | null>(null)
  const [description, setDescription] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState<ScanCropOutput | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('users').select('geminiApiKey').eq('id', user.id).single()
        if (profile?.geminiApiKey) setGroqKey(profile.geminiApiKey)
        
        const { data: history } = await supabase.from('crop_scan_results').select('*').eq('user_id', user.id).order('scanDate', { ascending: false }).limit(5)
        if (history) setScanHistory(history)
      }
    }
    init()
  }, [])

  const fallbackKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  const activeKey = groqKey || fallbackKey

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleScan = async () => {
    if (!image || !user || !activeKey) {
      toast({
        variant: "destructive",
        title: "Incomplete Setup",
        description: !activeKey ? "Add your Groq API Key in Settings." : "Upload an image.",
      })
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const output = await scanCrop({
        photoDataUri: image,
        description: description || "Analyzing crop health...",
        apiKey: activeKey
      })
      setResult(output)

      await supabase.from('crop_scan_results').insert({
        user_id: user.id,
        image_url: "simulated_path",
        scanDate: new Date().toISOString(),
        diseaseIdentified: output.diseaseName || (output.diseaseIdentified ? "Identified" : "Healthy"),
        confidenceScore: output.confidenceScore,
        recommendation: output.treatmentRecommendation,
        status: "Processed"
      })

      const { data: history } = await supabase.from('crop_scan_results').select('*').eq('user_id', user.id).order('scanDate', { ascending: false }).limit(5)
      if (history) setScanHistory(history)

      toast({ title: "Scan Complete" })
    } catch (error) {
      toast({ variant: "destructive", title: "Analysis Failed" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="space-y-2 px-1">
        <h2 className="text-3xl font-headline font-bold text-primary">Crop Disease Intelligence</h2>
        <p className="text-sm text-muted-foreground font-medium">Use your Groq key for instant AI diagnosis.</p>
      </div>

      {!groqKey && !process.env.NEXT_PUBLIC_GROQ_API_KEY && (
        <Alert variant="default" className="bg-orange-100 border-none rounded-[2rem] p-6 shadow-sm mx-1">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900 font-bold text-lg">API Key Required</AlertTitle>
          <AlertDescription className="text-orange-800 text-sm mt-1">
            To prevent system overload, users must provide their own Groq API Key. Go to <Link href="/dashboard/settings" className="underline font-bold">Settings</Link> to add yours.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8 px-1">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-none overflow-hidden bg-white">
            <CardContent className="pt-6 space-y-6">
              <div 
                className={`aspect-square w-full md:max-w-md mx-auto rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${image ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                {image ? (
                  <Image src={image} alt="Crop" fill className="object-cover" />
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">Upload photo to start</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} capture="environment" />
              
              <Textarea 
                placeholder="Describe symptoms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-2xl resize-none h-32 bg-slate-50 border-none shadow-inner"
              />

              <Button 
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                onClick={handleScan}
                disabled={isAnalyzing || !image || !activeKey}
              >
                {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Start Diagnosis"}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-none overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className={result.diseaseIdentified ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"}>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  {result.diseaseIdentified ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                  {result.diseaseIdentified ? "Disease Identified" : "Healthy Crop Detected"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4 bg-white">
                <p className="text-2xl font-headline font-bold text-foreground">{result.diseaseName}</p>
                <div className="p-6 rounded-[1.5rem] bg-accent/10 text-sm md:text-base leading-relaxed whitespace-pre-line text-foreground/80 font-medium">
                  {result.treatmentRecommendation}
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={() => {setResult(null); setImage(null);}}>Reset</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="rounded-[2.5rem] shadow-xl border-none bg-white h-fit overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 p-6">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <History className="h-5 w-5 text-primary" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             {scanHistory?.map((scan) => (
               <div key={scan.id} className="px-6 py-4 border-b last:border-0 hover:bg-primary/5 transition-colors">
                 <div className="text-sm font-bold text-slate-800">{scan.diseaseIdentified}</div>
                 <div className="text-[10px] text-muted-foreground font-medium">{new Date(scan.scanDate).toLocaleDateString()}</div>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
