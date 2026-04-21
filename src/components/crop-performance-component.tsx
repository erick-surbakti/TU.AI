"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { useEasyMode } from "@/components/easy-mode-provider"
import { Activity, Sparkles } from "lucide-react"
import * as React from "react"

// Localized farming wisdom in native languages - CRAZY ROTATION!
const FARMING_WISDOM = {
    MY: [
        " Padi adalah emas hijau, jaga dengan sepenuh hati",
        " Tanah subur adalah warisan, bersama kita pelihara",
        " Kerja cerdas, bukan kerja berat sahaja",
        " Air adalah sumber kehidupan padi kami",
        " Petani Melayu, tradisi penuh berkat",
    ],
    ID: [
        " Sawah adalah ibu, padi adalah anak yang dikasih",
        " Tani maju, bangsa maju, Indonesia kuat",
        " Gotong royong di sawah, kuat bersama kita",
        " Benih terbaik untuk panen melimpah",
        " Pagi cerah di tani adalah berkah Tuhan",
    ],
    TH: [
        " ข้าวคือชีวิต ชีวิตคือข้าว",
        " เกษตรกรไทย ยืนหยัดตั้งแต่หลายชั่วอายุ",
        " ปลูกดี เก็บเกี่ยวดี โภคเบิกบาน",
        " น้ำเหมือนน้ำใจ ไม่มีน้ำไม่มีเก็บ",
        " ไร่ข้าว คุณค่าของท้องที่",
    ],
    VN: [
        " Lúa là vàng, vàng là lúa",
        " Nông dân Việt, ơi nông dân Việt",
        " Gieo tốt, gặt tốt, đời tốt",
        " Đất tốt, hạt tốt, mưa tốt = lúa vàng",
        " Ánh nắng Việt chiếu rọi ruộng lúa",
    ],
    PH: [
        " Ang palay ay yaman ng bawat sakahan",
        " Magtani ng pag-asa, anihin ang tagumpay",
        " Sama-sama sa paliguan, sama-sama sa ani",
        " Tubig ay buhay, palay ay puso ng pamilya",
        " Ang tunay na yaman ay sa bukid",
    ],
    SG: [
        " From seed to harvest, we grow together",
        " Urban farming, community thriving",
        " Smart farming, sustainable Singapore",
        " Every grain counts in our island",
        " Green spaces, green future",
    ],
    BN: [
        " Sawah padi adalah kehidupan masyarakat",
        " Pertanian berkelanjutan untuk masa depan",
        " Berkah dari tanah yang subur",
        " Bersama kita tani, bersama kita maju",
        " Padi emas untuk kemakmuran bersama",
    ],
    KH: [
        " ស្រូវដំណាំគឺជីវិតរបស់យើងខ្ញុំ",
        " ស្រុកកម្ពុជា ស្រូវដំណាំដ៏សម្បូរ",
        " រីក្រាល់ក្នុងក្ដ ក្រោយក្នុងស្វាង",
        " ទឹកគឺឱសថ ទឹកគឺជីវន៍",
        " បងប្អូនកសិករ ធ្វើការក្នុងក្ដ",
    ],
    LA: [
        " ເຫຣ້ວຜະລອກຢາສາຍເສັຊາວໄຕ",
        " ກະສິກໍາ ຫວັງອາຍຸຍືນ",
        " ປະຕູມາດ ເປົ່າເມີດ ຢາໄວ້ໂດຍ",
        " ວຽກກະສິກໍາ ວຽກຮັກສາສະຫວັດ",
        " ແສງແດດ ຈາກສະຫວັນ ສະຫວາງທົ່ງນາ",
    ],
    MM: [
        " စိုက်ခြင်းသည် ကြွယ်ဝမှု၏ အမြစ်ဖြစ်သည်",
        " လယ်သမား မြန်မာ၊ ရိုးရာ ယုံကြည်မှု",
        " ရေတစ်ရွက် ကောင်းမွန်တဲ့ အသီး",
        " မြေကြီးကို ချစ်ခြင်း၊ စိုက်ခြင်း၏ အခြေခံ",
        " လယ်ထဲ အလုပ်လုပ်နေ ကြီးမြတ်သည့်",
    ],
}

// AI-estimated growth patterns based on country and season
const GROWTH_PATTERNS = {
    MY: [
        { day: "Mon", growth: 42 },
        { day: "Tue", growth: 48 },
        { day: "Wed", growth: 45 },
        { day: "Thu", growth: 58 },
        { day: "Fri", growth: 52 },
        { day: "Sat", growth: 65 },
        { day: "Sun", growth: 70 },
    ],
    ID: [
        { day: "Mon", growth: 48 },
        { day: "Tue", growth: 54 },
        { day: "Wed", growth: 51 },
        { day: "Thu", growth: 62 },
        { day: "Fri", growth: 58 },
        { day: "Sat", growth: 68 },
        { day: "Sun", growth: 75 },
    ],
    TH: [
        { day: "Mon", growth: 40 },
        { day: "Tue", growth: 45 },
        { day: "Wed", growth: 42 },
        { day: "Thu", growth: 55 },
        { day: "Fri", growth: 50 },
        { day: "Sat", growth: 63 },
        { day: "Sun", growth: 68 },
    ],
    VN: [
        { day: "Mon", growth: 44 },
        { day: "Tue", growth: 50 },
        { day: "Wed", growth: 47 },
        { day: "Thu", growth: 60 },
        { day: "Fri", growth: 54 },
        { day: "Sat", growth: 66 },
        { day: "Sun", growth: 72 },
    ],
    PH: [
        { day: "Mon", growth: 46 },
        { day: "Tue", growth: 52 },
        { day: "Wed", growth: 49 },
        { day: "Thu", growth: 61 },
        { day: "Fri", growth: 56 },
        { day: "Sat", growth: 67 },
        { day: "Sun", growth: 73 },
    ],
    SG: [
        { day: "Mon", growth: 43 },
        { day: "Tue", growth: 49 },
        { day: "Wed", growth: 46 },
        { day: "Thu", growth: 57 },
        { day: "Fri", growth: 53 },
        { day: "Sat", growth: 64 },
        { day: "Sun", growth: 70 },
    ],
    BN: [
        { day: "Mon", growth: 41 },
        { day: "Tue", growth: 47 },
        { day: "Wed", growth: 44 },
        { day: "Thu", growth: 56 },
        { day: "Fri", growth: 51 },
        { day: "Sat", growth: 62 },
        { day: "Sun", growth: 69 },
    ],
    KH: [
        { day: "Mon", growth: 45 },
        { day: "Tue", growth: 51 },
        { day: "Wed", growth: 48 },
        { day: "Thu", growth: 59 },
        { day: "Fri", growth: 55 },
        { day: "Sat", growth: 65 },
        { day: "Sun", growth: 71 },
    ],
    LA: [
        { day: "Mon", growth: 42 },
        { day: "Tue", growth: 48 },
        { day: "Wed", growth: 45 },
        { day: "Thu", growth: 57 },
        { day: "Fri", growth: 52 },
        { day: "Sat", growth: 63 },
        { day: "Sun", growth: 69 },
    ],
    MM: [
        { day: "Mon", growth: 40 },
        { day: "Tue", growth: 46 },
        { day: "Wed", growth: 43 },
        { day: "Thu", growth: 54 },
        { day: "Fri", growth: 49 },
        { day: "Sat", growth: 60 },
        { day: "Sun", growth: 67 },
    ],
}

interface CropPerformanceProps {
    countryCode?: string
    isEasyMode?: boolean
}

export function CropPerformance({
    countryCode = "MY",
    isEasyMode = false
}: CropPerformanceProps) {
    const [currentQuoteIndex, setCurrentQuoteIndex] = React.useState(0)
    const [isAnimating, setIsAnimating] = React.useState(false)

    // Rotate quotes every 4 seconds
    React.useEffect(() => {
        const quotes = FARMING_WISDOM[countryCode as keyof typeof FARMING_WISDOM] || FARMING_WISDOM.MY
        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
                setIsAnimating(false)
            }, 300)
        }, 4000)
        return () => clearInterval(interval)
    }, [countryCode])

    const chartData = GROWTH_PATTERNS[countryCode as keyof typeof GROWTH_PATTERNS] || GROWTH_PATTERNS.MY
    const quotes = FARMING_WISDOM[countryCode as keyof typeof FARMING_WISDOM] || FARMING_WISDOM.MY
    const currentQuote = quotes[currentQuoteIndex]

    return (
        <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
            {/* CRAZY FILLED HEADER with rotating quotes */}
            <div className="relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 opacity-100" />

                {/* Animated blob shapes for extra craziness */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

                <CardHeader className="relative z-10 p-8 md:p-10 space-y-6">
                    <div className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className={cn(
                                "font-headline font-bold text-white transition-all",
                                isEasyMode ? "text-3xl" : "text-2xl"
                            )}>
                                Crop Performance
                            </CardTitle>
                            <CardDescription className={cn(
                                "font-medium text-white/90 transition-all",
                                isEasyMode ? "text-xl" : "text-lg"
                            )}>
                                Live health & growth index for Block A (Padi)
                            </CardDescription>
                        </div>
                        <div className={cn(
                            "bg-white/20 rounded-2xl flex items-center justify-center shadow-inner transition-all backdrop-blur-sm border border-white/30",
                            isEasyMode ? "h-20 w-20" : "h-14 w-14"
                        )}>
                            <Activity className={cn(
                                "text-white transition-all",
                                isEasyMode ? "h-10 w-10" : "h-7 w-7"
                            )} />
                        </div>
                    </div>

                    {/* Rotating farming wisdom quote - CRAZY ANIMATED */}
                    <div className="relative min-h-[60px] flex items-center">
                        <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center px-5 overflow-hidden">
                            {/* Animated background shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

                            {/* Quote text with fade animation */}
                            <div className={cn(
                                "relative z-10 text-sm md:text-base font-bold text-white leading-relaxed transition-all duration-300",
                                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                            )}>
                                {currentQuote}
                            </div>
                        </div>

                        {/* Rotating dots indicator */}
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1.5 z-20">
                            {quotes.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                        idx === currentQuoteIndex ? "bg-white scale-125" : "bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </div>

            {/* Chart Content */}
            <CardContent className="px-8 md:px-10 pb-10 pt-8">
                <div className="h-[300px] w-full">
                    <ChartContainer config={{ growth: { label: "Growth Index", color: "hsl(var(--primary))" } }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <YAxis hide />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="growth"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorGrowth)"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 4, stroke: "#fff" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
                    <div className="space-y-1">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Avg Growth</div>
                        <div className="text-2xl font-black text-slate-800">
                            {Math.round(chartData.reduce((a, b) => a + b.growth, 0) / chartData.length)}%
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Peak Day</div>
                        <div className="text-2xl font-black text-emerald-600">
                            {chartData.reduce((max, b) => b.growth > max.growth ? b : max).day}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</div>
                        <div className="text-lg font-black text-emerald-600 flex items-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            Thriving
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">AI Confidence</div>
                        <div className="text-2xl font-black text-slate-800">94%</div>
                    </div>
                </div>
            </CardContent>

            {/* Add animation keyframes via style tag */}
            <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </Card>
    )
}

export default CropPerformance