"use client"

import * as React from "react"
import { ShieldAlert, Globe, BarChart3, Loader2, AlertTriangle, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { riskIntel, type RiskIntelOutput } from "@/ai/flows/risk-intel-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createClient } from "@/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Country-specific risk intel data
const RISK_INTEL_BY_COUNTRY: Record<string, { name: string; currency: string; intel: RiskIntelOutput; priceData: Array<{ label: string; price: string; trend: 'up' | 'down' | 'stable'; change: string }> }> = {
  ID: {
    name: "Indonesia",
    currency: "IDR",
    intel: {
      alertLevel: "Medium",
      potentialImpactSummary: "Sektor pertanian Indonesia menghadapi risiko sedang karena fluktuasi harga bahan bakar global dan kuota ekspor pupuk urea. Rantai pasokan lokal stabil tetapi biaya meningkat karena keterlambatan pengiriman maritim.",
      recommendedActions: [
        "Pesan pupuk esensial sebelumnya untuk siklus penanaman berikutnya.",
        "Adopsi sensor kelembaban tanah untuk mengurangi biaya irigasi.",
        "Diversifikasi tanaman jangka pendek untuk mempertahankan arus kas.",
        "Pantau pembaruan kebijakan federal tentang subsidi bahan bakar dan pupuk."
      ]
    },
    priceData: [
      { label: "Pupuk (NPK)", price: "Rp 8.200/kg", trend: "up", change: "+12%" },
      { label: "Diesel", price: "Rp 5.150/L", trend: "stable", change: "0%" },
      { label: "Padi Premium", price: "Rp 5.450/kg", trend: "up", change: "+4%" }
    ]
  },
  MY: {
    name: "Malaysia",
    currency: "MYR",
    intel: {
      alertLevel: "Medium",
      potentialImpactSummary: "Sektor pertanian Malaysia menghadapi risiko sedang karena fluktuasi harga bahan bakar global dan kuota ekspor pupuk urea. Rantai pasokan lokal stabil tetapi biaya meningkat karena keterlambatan pengiriman maritim.",
      recommendedActions: [
        "Pesan pupuk esensial sebelumnya untuk siklus penanaman berikutnya.",
        "Adopsi sensor kelembaban tanah untuk mengurangi biaya irigasi.",
        "Diversifikasi tanaman jangka pendek untuk mempertahankan arus kas.",
        "Pantau pembaruan kebijakan federal tentang subsidi bahan bakar dan pupuk."
      ]
    },
    priceData: [
      { label: "Pupuk (NPK)", price: "RM 820/kg", trend: "up", change: "+12%" },
      { label: "Diesel", price: "RM 2.15/L", trend: "stable", change: "0%" },
      { label: "Padi Premium", price: "RM 1.45/kg", trend: "up", change: "+4%" }
    ]
  },
  TH: {
    name: "Thailand",
    currency: "THB",
    intel: {
      alertLevel: "Low",
      potentialImpactSummary: "ภาคเกษตรของไทยกำลังเผชิญความเสี่ยงต่ำ สภาพอากาศนั้นเอื้ออำนวย และตลาดส่งออกแข็งแกร่ง ราคาข้าวและสินค้าเกษตรหลักนั้นมีเสถียรภาพดี",
      recommendedActions: [
        "ตรวจสอบพยากรณ์ฝนเพื่อวางแผนการเก็บเกี่ยว",
        "ลงทุนในอุปกรณ์เก็บเกี่ยวขั้นสูง",
        "เข้าร่วมเครือข่ายส่งออกข้าว",
        "ติดตามราคาข้าวในตลาดโลก"
      ]
    },
    priceData: [
      { label: "ปุ๋ย (NPK)", price: "฿ 18,500/ตัน", trend: "stable", change: "0%" },
      { label: "ดีเซล", price: "฿ 32/L", trend: "up", change: "+3%" },
      { label: "ข้าวขาว", price: "฿ 14/kg", trend: "stable", change: "+2%" }
    ]
  },
  PH: {
    name: "Philippines",
    currency: "PHP",
    intel: {
      alertLevel: "High",
      potentialImpactSummary: "Ang sektor ng agrikultura ng Pilipinas ay nakaharap sa mataas na panganib dahil sa season na parating na tag-ulan at potensyal na pagbabago ng panahon. Ang supply chain ng input ay maaaring maapektuhan ng geopolitikal na usap.",
      recommendedActions: [
        "Maghanda ng drainage systems para sa bagyo",
        "Sumali sa crop insurance program ng pamahalaan",
        "Mag-diversify ng crop varieties para sa resilience",
        "Mag-stock ng agricultural inputs bago ang tag-ulan"
      ]
    },
    priceData: [
      { label: "Pupuk (NPK)", price: "₱ 1,850/kg", trend: "up", change: "+15%" },
      { label: "Diesel", price: "₱ 55/L", trend: "up", change: "+5%" },
      { label: "Palay", price: "₱ 18/kg", trend: "down", change: "-3%" }
    ]
  },
  VN: {
    name: "Vietnam",
    currency: "VND",
    intel: {
      alertLevel: "Medium",
      potentialImpactSummary: "Khu vực nông nghiệp Việt Nam đang phải đối mặt với rủi ro trung bình do những biến động trong giá cà phê toàn cầu và chuỗi cung ứng tấm xuất khẩu. Các thị trường cà phê và tôm đang chịu áp lực từ giá cả.",
      recommendedActions: [
        "Chuyển đổi sang canh tác cà phê Arabica cao cấp",
        "Đầu tư vào hệ thống nuôi tôm hiện đại",
        "Đăng ký chứng chỉ canh tác bền vững",
        "Theo dõi giá cà phê trên thị trường thế giới"
      ]
    },
    priceData: [
      { label: "Phân bón (NPK)", price: "₫ 18,500/kg", trend: "up", change: "+8%" },
      { label: "Dầu diesel", price: "₫ 25,500/L", trend: "stable", change: "0%" },
      { label: "Cà phê Robusta", price: "₫ 85,000/kg", trend: "down", change: "-5%" }
    ]
  },
  SG: {
    name: "Singapore",
    currency: "SGD",
    intel: {
      alertLevel: "Low",
      potentialImpactSummary: "Singapore's agritech and vertical farming sector remains stable with strong government support. Urban farming resilience is high, and alternative protein production is accelerating with minimal supply chain disruptions.",
      recommendedActions: [
        "Expand vertical farming capacity with government grants",
        "Invest in advanced IoT and climate control systems",
        "Develop partnerships with regional suppliers",
        "Monitor global agritech investment trends"
      ]
    },
    priceData: [
      { label: "Hydroponic Nutrients", price: "S$ 85/kg", trend: "stable", change: "0%" },
      { label: "Electricity (Peak)", price: "S$ 0.28/kWh", trend: "up", change: "+2%" },
      { label: "Leafy Greens", price: "S$ 8/kg", trend: "stable", change: "-1%" }
    ]
  },
  MM: {
    name: "Myanmar",
    currency: "MMK",
    intel: {
      alertLevel: "High",
      potentialImpactSummary: "ကျေးလယ်စိတ်ဆာင်းဒ်သည် မြင့်မားသောအန္တရာယ်ကိုတွေ့ကြုံနေသည်။ သို့မဟုတ် မြန်မာ၊ အချုပ်အခိုင်းအဆုံးအကြောင်းအရာတွေ့ ဖြစ်စေသည်။",
      recommendedActions: [
        "ကုန်သွယ်မှုချိတ်ဆက်မှုများကို အားလုံးအတူတူမျှ ခွဲခြားပါ",
        "ရိုးရာ အများစုအကြောင်း မည်သည့် အလုပ်အကိုင်များ ရှာဖွေပါ",
        "ကျေးလယ်သမားအုပ်စုများကို ပူးပေါင်းမှုများ များများ အားထုတ်ပါ",
        "ရိုးရာအမွေအနှစ် သီးသန့်ကျေးလယ်လုပ်ငန်းများ လုပ်ကိုင်ပါ"
      ]
    },
    priceData: [
      { label: "Fertilizer (NPK)", price: "K 8,200/kg", trend: "up", change: "+18%" },
      { label: "Diesel", price: "K 4,500/L", trend: "up", change: "+12%" },
      { label: "Rice", price: "K 1,450/kg", trend: "stable", change: "+1%" }
    ]
  },
  LA: {
    name: "Laos",
    currency: "LAK",
    intel: {
      alertLevel: "Low",
      potentialImpactSummary: "ພະລັງງານກະສິກໍາຂອງລາວມີຄວາມໝັ້ນຄົງທີ່ດີ ກັບຄວາມເປັນໄປໄດ້ສູງສຸດ ການເກັບເກ່ຽວກາເຟທີ່ເພີ່ມຂຶ້ນ ແລະ ລາວມີຕະຫຼາດສົ່ງອອກທີ່ເຂັ້ມແຂງ",
      recommendedActions: [
        "ຂະຫຍາຍການປູກເກາະກາເຟ Arabica ທີ່ມີມູນຄ່າສູງ",
        "ລົງທຶນໃນເຄື່ອງຈັກປຸງແຕ່ງກາເຟທີ່ທັນສະໄໝ",
        "ເຂົ້າກຸ່ມຕົວແທນກາເຟລາວ",
        "ຕິດຕາມກໍາລັງລາຄາກາເຟໃນລະຫວ່າງໂລກ"
      ]
    },
    priceData: [
      { label: "ປຸ໋ຍ (NPK)", price: "₭ 185,000/kg", trend: "up", change: "+7%" },
      { label: "ດີເຊລ", price: "₭ 48,500/L", trend: "stable", change: "-1%" },
      { label: "ກາເຟ Robusta", price: "₭ 580,000/kg", trend: "down", change: "-4%" }
    ]
  },
  KH: {
    name: "Cambodia",
    currency: "KHR",
    intel: {
      alertLevel: "Medium",
      potentialImpactSummary: "វិស័យកសិកម្មកម្ពុជាប្រឈមមុខនឹងលក្ខណៈហានិភ័យមិនមែនដែលលើស ដោយសារតែលក្ខខណ្ឌឧទ្ធម័ន្តិកមិនស្ថិតស្ថេរ និងច្របាច់លូនក្នុងប្រទេស។",
      recommendedActions: [
        "សម្រួលប្រព័ន្ធទឹកក្នុងសាលក្រមុង",
        "ដាក់ឈ្មោះក្នុងកម្មវិធីផ្តល់ប្រឡាក់ដល់ដំណាំ",
        "បែងចែកប្រភេទដំណាំដើម្បីលើកតម្រូវប្រទេស",
        "ប្រមូលផ្តុំលក្ខណៈស្វាគមន៍កសិកម្មមុនពេលរដូវ"
      ]
    },
    priceData: [
      { label: "ជី (NPK)", price: "៛ 8,850/kg", trend: "up", change: "+10%" },
      { label: "ឈាម", price: "៛ 4,850/L", trend: "up", change: "+8%" },
      { label: "ស្រូវ", price: "៛ 2,150/kg", trend: "stable", change: "+3%" }
    ]
  },
  BN: {
    name: "Brunei",
    currency: "BND",
    intel: {
      alertLevel: "Low",
      potentialImpactSummary: "Brunei's small-scale agricultural sector remains stable with strong government support for agro-tourism and organic farming. Supply chains are efficient with minimal disruption risk.",
      recommendedActions: [
        "Expand organic vegetable production for government procurement",
        "Invest in agro-tourism infrastructure development",
        "Develop aquaculture operations in Temburong",
        "Join government agricultural training programs"
      ]
    },
    priceData: [
      { label: "Organic Fertilizer", price: "B$ 125/kg", trend: "stable", change: "0%" },
      { label: "Diesel", price: "B$ 1.85/L", trend: "down", change: "-2%" },
      { label: "Organic Vegetables", price: "B$ 12/kg", trend: "stable", change: "+1%" }
    ]
  }
}

export default function RiskIntelPage() {
  const supabase = createClient()
  const [groqKey, setGroqKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")
  const [intel, setIntel] = React.useState<RiskIntelOutput | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let currentCountry = "MY"

      if (user) {
        const { data } = await supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single()
        if (data?.geminiApiKey) setGroqKey(data.geminiApiKey)
        if (data?.countryCode) {
          currentCountry = data.countryCode
          setCountryCode(currentCountry)
        }
      }

      // Load country-specific intel
      const countryData = RISK_INTEL_BY_COUNTRY[currentCountry]
      if (countryData) {
        setIntel(countryData.intel)
      }
      setMounted(true)
    }
    init()
  }, [])

  // Re-load intel when country changes
  React.useEffect(() => {
    if (mounted) {
      const countryData = RISK_INTEL_BY_COUNTRY[countryCode]
      if (countryData) {
        setIntel(countryData.intel)
      }
    }
  }, [countryCode, mounted])

  const fallbackKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  const activeKey = groqKey || fallbackKey
  const countryData = RISK_INTEL_BY_COUNTRY[countryCode]

  const fetchIntel = async () => {
    if (!activeKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Add your Groq key in Settings to run scans."
      })
      return
    }

    setLoading(true)
    try {
      const data = await riskIntel({
        region: countryData?.name || "Local Region",
        countryCode: countryCode,
        newsSummary: "Global shipping delays reported. Crude oil prices stabilizing. Regional export bans maintained.",
        commodityPrices: { "Fertilizer (NPK)": 820, "Diesel": 2.15 },
        exportImportBans: ["Regional Export Ban"],
        policyUpdates: "New federal subsidy updates for agriculture.",
        apiKey: activeKey
      })
      setIntel(data)
      toast({ title: "Risk Scan Complete", description: `Scan completed for ${countryData?.name}` })
    } catch (error) {
      toast({ variant: "destructive", title: "Scan Failed" })
    } finally {
      setLoading(false)
    }
  }

  const alertColors = {
    Low: "bg-emerald-500",
    Medium: "bg-yellow-500",
    High: "bg-orange-500",
    Critical: "bg-destructive"
  }

  if (!mounted || !intel || !countryData) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit">
            <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Supply Chain Intelligence
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-slate-900">Risk Intel & Shock Prediction</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 font-medium">
              {countryData.name} • Grounded regional assessments
            </p>
          </div>
        </div>
        <Button
          onClick={fetchIntel}
          className="h-11 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg active:scale-95 transition-all text-sm sm:text-base"
          disabled={loading}
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Run Risk Scan
        </Button>
      </div>

      {/* API Key Alert */}
      {!groqKey && !process.env.NEXT_PUBLIC_GROQ_API_KEY && (
        <Alert className="bg-blue-50 border-blue-100 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 font-bold text-sm sm:text-base ml-2">Using Mockup Intelligence</AlertTitle>
          <AlertDescription className="text-blue-800 text-xs sm:text-sm ml-2 leading-relaxed mt-1">
            To unlock live risk scanning, add your Groq API key in <Link href="/dashboard/settings" className="underline font-bold">Settings</Link>.
            Currently showing {countryData.name}-specific sample data.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700", loading && "opacity-50 pointer-events-none")}>
        {/* Left: Risk Assessment Card */}
        <Card className="lg:col-span-2 rounded-2xl sm:rounded-[2rem] border-none shadow-lg sm:shadow-xl overflow-hidden bg-white">
          <div className={cn("h-1.5 sm:h-3 w-full", alertColors[intel.alertLevel as keyof typeof alertColors])} />
          <CardHeader className="bg-white p-5 sm:p-8 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <CardTitle className="font-headline font-bold text-lg sm:text-2xl">Regional Risk Assessment</CardTitle>
              <div className={cn(
                "px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 w-fit",
                alertColors[intel.alertLevel as keyof typeof alertColors]
              )}>
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {intel.alertLevel} Alert
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-5 sm:p-8 pt-3 sm:pt-4 space-y-6 sm:space-y-8">
            {/* Impact Summary */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 border-l-4 border-l-primary space-y-3 sm:space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black flex items-center gap-2 text-primary text-[9px] sm:text-[10px] uppercase tracking-wider">
                  <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Impact Summary
                </h4>
                {intel.groundingProof && (
                  <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-tighter border border-blue-100 flex items-center gap-1">
                    <Globe className="h-2 w-2" /> Verified
                  </div>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed font-bold text-xs sm:text-sm">{intel.potentialImpactSummary}</p>
              {intel.groundingProof && (
                <div className="bg-white/50 p-3 rounded-lg sm:rounded-xl border border-dashed border-slate-200">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 italic font-medium leading-relaxed">
                    "Source: {intel.groundingProof}"
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-headline font-bold text-base sm:text-lg">Preventative Actions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {intel.recommendedActions.map((action, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg sm:rounded-2xl bg-white border border-slate-100 transition-all hover:border-primary hover:shadow-md">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs">
                      {i + 1}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50/50 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 border-t text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <span>Verified TUAI Intelligence Engine</span>
            <span>Grounded in ASEAN Data</span>
          </div>
        </Card>

        {/* Right: Market Shocks Card */}
        <div className="space-y-6">
          <Card className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-lg sm:shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-primary text-white p-5 sm:p-6">
              <CardTitle className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Market Shocks
                </div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/60">{countryData.currency} • Grounded Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-8">
              <div className="space-y-5 sm:space-y-6">
                {countryData.priceData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-5 sm:pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 sm:mb-1.5">{item.label}</div>
                      <div className="text-lg sm:text-xl font-headline font-bold text-slate-800">{item.price}</div>
                    </div>
                    <div className={cn(
                      "text-[8px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap",
                      item.trend === 'up' ? 'bg-orange-100 text-orange-600' : item.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    )}>
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 sm:mt-10 rounded-lg sm:rounded-xl h-11 sm:h-14 font-black text-[9px] sm:text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 transition-all">
                Full Market Index
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}