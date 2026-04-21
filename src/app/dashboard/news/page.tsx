"use client"

import * as React from "react"
import { Newspaper, Loader2, Sparkles, AlertTriangle, ArrowRight, TrendingUp, FileText, AlertCircle, Globe, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateNewsBatch, type NewsAnalysisOutput } from "@/ai/flows/news-analysis-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// ASEAN Country Names
const COUNTRY_NAMES: Record<string, string> = {
  BN: "Brunei",
  KH: "Cambodia",
  ID: "Indonesia",
  LA: "Laos",
  MY: "Malaysia",
  MM: "Myanmar",
  PH: "Philippines",
  SG: "Singapore",
  TH: "Thailand",
  VN: "Vietnam"
}

// Country-Specific News Pools
const NEWS_BY_COUNTRY: Record<string, { local: NewsAnalysisOutput[]; global: NewsAnalysisOutput[] }> = {
  ID: {
    local: [
      {
        title: "Indonesia to Implement B50 Biofuel Mandate by July 2026",
        summary: "Minister Sulaiman announces plans to cease diesel imports as the nation shifts to a 50% palm-oil blend to boost energy sovereignty.",
        articleBody: "### Fuel Independence\nIndonesia is aggressively moving towards B50 biodiesel. This shift is expected to absorb a significant portion of domestic crude palm oil (CPO) production, supporting local smallholders while reducing reliance on international fuel markets.\n\n### Impact on Farmers\nIncreased domestic demand for CPO is likely to stabilize floor prices for fresh fruit bunches (FFB). Farmers should monitor provincial price announcements closely as the mandate approaches.",
        riskLevel: "Low",
        actions: ["Optimize CPO harvesting cycles", "Join local Smallholder Cooperatives", "Monitor B50 infrastructure updates"],
        sourceName: "Big News Network",
        sourceUrl: "https://www.bignewsnetwork.com/"
      },
      {
        title: "Indonesian Rice Reserves Hit 4.8 Million Tonnes",
        summary: "Government food security strengthened as domestic production meets all national demand, reducing import dependency.",
        articleBody: "### Strategic Reserves\nWith record-high stockpiles, Indonesia's food security is reaching a new milestone. The government has declared stability in rice markets despite global volatility.\n\n### Regional Impact\nIndonesia's stable rice supply is supporting ASEAN-wide food security initiatives. Smallholder farmers are encouraged to register with local distribution networks.",
        riskLevel: "Low",
        actions: ["Register with Sembako networks", "Apply for water-pump subsidies", "Utilize drought-resistant seeds"],
        sourceName: "Antara News",
        sourceUrl: "https://www.antaranews.com/"
      },
      {
        title: "Precision Agriculture Adoption Surges Across Java",
        summary: "Smart farming technologies spreading from large commercial farms to smallholder networks across Central and East Java.",
        articleBody: "### Technology Diffusion\nDrone usage for crop monitoring and IoT sensors for soil health are becoming standard practices. Government extension programs are subsidizing equipment for cooperative members.\n\n### Farmer Benefits\nSmallholders using smart farming are reporting 15-25% yield improvements. Digital record-keeping is now linked to better credit access from agricultural banks.",
        riskLevel: "Low",
        actions: ["Join digital farming cooperatives", "Apply for drone equipment grants", "Complete digital literacy training"],
        sourceName: "Kemtan Official",
        sourceUrl: "https://www.pertanian.go.id/"
      }
    ],
    global: [
      {
        title: "Global CPO Prices Rise as Asian Demand Strengthens",
        summary: "Palm oil futures hit 6-month highs as China increases biodiesel commitments, supporting Southeast Asian producers.",
        articleBody: "### Market Dynamics\nChinese biodiesel imports are driving global crude palm oil prices upward. This presents a favorable window for ASEAN exporters to maximize production.\n\n### Long-term Outlook\nSustainability concerns remain but market fundamentals are strong through Q3 2026.",
        riskLevel: "Low",
        actions: ["Monitor global palm futures", "Strengthen sustainability certifications", "Plan harvest scheduling"],
        sourceName: "Bloomberg",
        sourceUrl: "https://www.bloomberg.com/"
      },
      {
        title: "El Niño Impact Forecasted for Late 2026",
        summary: "Climate forecasts warn of potential drought conditions across Southeast Asia in Q4, affecting multiple crop cycles.",
        articleBody: "### Climate Alert\nMeteorological agencies are preparing drought warnings. Farmers should consider water storage and irrigation investments now.\n\n### Preparation Strategy\nAdopt drought-resistant varieties and water conservation techniques ahead of the peak dry season.",
        riskLevel: "High",
        actions: ["Install water harvesting systems", "Switch to drought-resistant varieties", "Review crop insurance coverage"],
        sourceName: "NOAA Climate Center",
        sourceUrl: "https://www.noaa.gov/"
      }
    ]
  },
  MY: {
    local: [
      {
        title: "Malaysia Inventories Hit 7-Month Low as Palm Exports Surge",
        summary: "Global demand from India and China drives a recovery in exports, putting upward pressure on regional CPO prices.",
        articleBody: "### Supply Tightness\nWith inventories decreasing to multi-month lows, the market is entering a tightening phase. This is providing a much-needed boost to CPO futures in the Malaysian Derivatives Exchange.\n\n### Export Readiness\nFarmers are seeing better margins as export demand holds steady, though geopolitical tensions in the Middle East remain a volatility factor to watch.",
        riskLevel: "Moderate",
        actions: ["Monitor Bursa Malaysia CPO futures", "Maintain machinery for high output", "Audit plantation logistics"],
        sourceName: "Bernama",
        sourceUrl: "https://www.bernama.com/"
      },
      {
        title: "Malaysia Smart Tech Adoption Accelerates for 2026",
        summary: "New grants announced for smallholders adopting drones and blockchain-based traceability tools for global export compliance.",
        articleBody: "### Precision Growth\nTechnology is now a requirement rather than a luxury for competitive farming. The government is rolling out significant subsidies for drones used in fertilizer application and surveillance.\n\n### Transparency\nBlockchain tools are being integrated at the mill level, requiring farmers to maintain better digital records of their harvesting logs to access premium export markets.",
        riskLevel: "Moderate",
        actions: ["Apply for drone hardware grants", "Digitize harvesting records", "Verify MSPO/RSPO certifications"],
        sourceName: "Farmonaut",
        sourceUrl: "https://farmonaut.com/"
      },
      {
        title: "Peninsular Malaysia Rainfall Patterns Shift for Southwest Monsoon",
        summary: "Early forecasts suggest irregular rainfall distribution; farmers urged to adjust irrigation strategies for 2026 planting season.",
        articleBody: "### Weather Advisory\nMetMalaysia warns of uneven monsoon progression. Farmers in drought-prone areas should prepare contingency plans.\n\n### Action Items\nUpgrade irrigation systems and consider crop diversification to mitigate monsoon-related risks.",
        riskLevel: "Moderate",
        actions: ["Check irrigation infrastructure", "Diversify crop portfolio", "Monitor weather forecasts closely"],
        sourceName: "MetMalaysia",
        sourceUrl: "https://www.met.gov.my/"
      }
    ],
    global: [
      {
        title: "RSPO Certification Becomes Mandatory for EU Palm Oil Imports",
        summary: "European Union strengthens sustainability requirements; only certified sustainable palm can enter EU market by 2026.",
        articleBody: "### Market Access\nMalaysian producers must ensure RSPO compliance to maintain EU market access. This is a critical requirement for premium pricing.\n\n### Certification Push\nAccelerate certification processes now to avoid market disruptions.",
        riskLevel: "High",
        actions: ["Verify RSPO certification status", "Engage with certification auditors", "Document sustainability practices"],
        sourceName: "EU Agri Commission",
        sourceUrl: "https://agriculture.ec.europa.eu/"
      },
      {
        title: "Global Fertilizer Prices Stabilize After Recent Volatility",
        summary: "International fertilizer markets show signs of stabilization as supply chains normalize post-crisis.",
        articleBody: "### Cost Relief\nFertilizer prices are moderating after months of volatility. This provides relief for farming operations across the region.\n\n### Procurement Strategy\nLock in favorable prices through long-term supplier agreements where possible.",
        riskLevel: "Low",
        actions: ["Negotiate bulk fertilizer contracts", "Stock up on seasonal requirements", "Monitor global commodity markets"],
        sourceName: "FAO Food Price Index",
        sourceUrl: "https://www.fao.org/"
      }
    ]
  },
  TH: {
    local: [
      {
        title: "Thai Rice Exports Reach 5-Year High Amid Regional Demand Surge",
        summary: "Government trade initiatives boost rice exports to ASEAN neighbors; milling industry sees strong capacity utilization.",
        articleBody: "### Export Boom\nThailand's rice sector is experiencing strong momentum as neighboring countries increase their import requirements. Domestic prices are holding firm.\n\n### Farmer Advantage\nSmallholder rice farmers are benefiting from stable demand and pricing. Agricultural cooperatives are processing record volumes.",
        riskLevel: "Low",
        actions: ["Coordinate with rice cooperatives", "Plan seasonal production cycles", "Quality certification for exports"],
        sourceName: "Thai Commerce Ministry",
        sourceUrl: "https://www.moc.go.th/"
      },
      {
        title: "Cassava Production Targets Increased for Starch and Ethanol Demand",
        summary: "Government incentives driving cassava cultivation expansion to meet growing industrial demand for biofuel and food starch.",
        articleBody: "### Agro-Industrial Growth\nCassava is becoming a high-value crop due to industrial demand. Processing facilities are expanding across the Northeast and Central regions.\n\n### Farmer Opportunity\nCassava contract farming offers predictable income. Government support ensures steady market access.",
        riskLevel: "Low",
        actions: ["Explore cassava contract farming", "Join cassava producer associations", "Invest in root crop diversification"],
        sourceName: "Royal Thai Agricultural Ministry",
        sourceUrl: "https://www.moac.go.th/"
      },
      {
        title: "Chao Phraya River Water Management Revamped for Dry Season",
        summary: "New irrigation distribution system implemented to ensure equitable water access during dry season farming months.",
        articleBody: "### Water Security\nThe revised water management protocol ensures farmers in upper and central regions have adequate irrigation access.\n\n### Planning Advantage\nFarmers can now plan irrigation-dependent crops with greater confidence during the dry season (November-April).",
        riskLevel: "Low",
        actions: ["Register for irrigation allocation", "Plan dry-season crop calendar", "Maintain water-saving techniques"],
        sourceName: "RID Thailand",
        sourceUrl: "https://www.rid.go.th/"
      }
    ],
    global: [
      {
        title: "Global Sugar Market Faces Production Cuts in Brazil",
        summary: "Brazilian drought impacts global sugar supply; Thailand positioned to gain market share as alternative supplier.",
        articleBody: "### Market Opportunity\nWith Brazilian sugar output declining, global prices are rising. Thai producers can compete for premium export markets.\n\n### Strategic Position\nThailand's sugar industry should increase production to capitalize on favorable market conditions.",
        riskLevel: "Low",
        actions: ["Increase sugarcane acreage", "Monitor global sugar futures", "Strengthen export logistics"],
        sourceName: "International Sugar Organization",
        sourceUrl: "https://www.isosugar.org/"
      },
      {
        title: "WTO Agricultural Trade Rules Evolve on Climate Resilience",
        summary: "New international guidelines emphasize climate-smart agriculture; certification programs emerging for premium market access.",
        articleBody: "### Compliance Opportunity\nThailand can leverage climate-smart farming practices to access premium export markets and secure sustainability credentials.\n\n### Farmer Benefits\nEarly adoption positions Thai farmers for higher-value export opportunities.",
        riskLevel: "Low",
        actions: ["Adopt climate-smart practices", "Pursue sustainability certifications", "Join farmer training programs"],
        sourceName: "WTO Agriculture Committee",
        sourceUrl: "https://www.wto.org/"
      }
    ]
  },
  PH: {
    local: [
      {
        title: "Philippine Coconut Industry Targets 1M Hectares for Premium Calamansi Production",
        summary: "Strategic crop diversification initiative supports smallholders transitioning from coconut monoculture to high-value specialty crops.",
        articleBody: "### Crop Diversification\nThe Department of Agriculture is promoting intercropping models combining coconut with calamansi and other citrus varieties.\n\n### Income Stability\nSmallholders can achieve better income stability through diversified crop portfolios. Market demand for Filipino citrus is strong.",
        riskLevel: "Low",
        actions: ["Join DA crop diversification programs", "Learn intercropping techniques", "Access calamansi seedling support"],
        sourceName: "DA Philippines",
        sourceUrl: "https://www.da.gov.ph/"
      },
      {
        title: "Typhoon Season Preparation: Enhanced Crop Insurance Available",
        summary: "Government expands agricultural insurance coverage for typhoon and flooding damage ahead of 2026 monsoon season.",
        articleBody: "### Risk Management\nNew insurance products cover crop losses from extreme weather. Premiums are heavily subsidized for smallholders and cooperatives.\n\n### Protection Strategy\nEnroll in government insurance programs before the peak typhoon season (July-November).",
        riskLevel: "Moderate",
        actions: ["Enroll in crop insurance programs", "Strengthen farm structures", "Prepare drainage and flood management"],
        sourceName: "Philippine Crop Insurance Corp",
        sourceUrl: "https://www.pcic.gov.ph/"
      },
      {
        title: "Abaca Fiber Exports Surge on Global Sustainable Fashion Demand",
        summary: "Traditional Philippine abaca crop experiences renaissance as global textile industry shifts toward sustainable natural fibers.",
        articleBody: "### Market Revival\nFashion brands increasingly demand sustainable fibers. Philippine abaca is perfectly positioned to meet this growing market segment.\n\n### Farmer Advantage\nAbaca farmers are seeing premium prices and steady export demand. Cooperatives are forming to aggregate production.",
        riskLevel: "Low",
        actions: ["Invest in abaca plantation", "Join abaca farmer associations", "Learn premium processing techniques"],
        sourceName: "Philippine Exporters Confederation",
        sourceUrl: "https://www.philexport.ph/"
      }
    ],
    global: [
      {
        title: "Asian Fertilizer Supply Chain Stabilizes After 2025 Disruptions",
        summary: "Manufacturing capacity increases across India and Thailand; Asian farmers see relief from fertilizer cost spikes.",
        articleBody: "### Cost Relief\nGlobal fertilizer prices are moderating as supply chain disruptions ease. Asian producers are well-positioned.\n\n### Farmer Benefit\nInput costs are stabilizing, improving profit margins for farming operations across the region.",
        riskLevel: "Low",
        actions: ["Lock in fertilizer prices", "Plan budget based on stable costs", "Explore precision fertilizer application"],
        sourceName: "FAO Fertilizer Report",
        sourceUrl: "https://www.fao.org/"
      },
      {
        title: "Regional Food Security Strengthened Through ASEAN Trade Agreements",
        summary: "ASEAN agriculture ministers finalize framework for tariff-free agricultural trade; supports regional food security goals.",
        articleBody: "### Trade Integration\nASEAN farmers gain access to larger regional markets. Trade barriers between member nations are being reduced.\n\n### Export Opportunities\nPhilippine producers can expand sales within ASEAN region with reduced tariff barriers.",
        riskLevel: "Low",
        actions: ["Explore ASEAN export markets", "Meet regional quality standards", "Join regional farmer networks"],
        sourceName: "ASEAN Secretariat",
        sourceUrl: "https://www.aseanregional.org/"
      }
    ]
  },
  VN: {
    local: [
      {
        title: "Vietnam Coffee Arabica Acreage Expands in Central Highlands",
        summary: "Premium arabica coffee cultivation gaining traction as farmers transition from robusta monoculture; Nescafé partners invest heavily.",
        articleBody: "### Premium Shift\nVietnamese coffee farmers are diversifying toward higher-value arabica varieties. International brands are supporting this transition with contracts and technical assistance.\n\n### Price Premium\nArabica commands 20-30% price premium over robusta. Farmers switching to arabica are seeing significant income improvements.",
        riskLevel: "Low",
        actions: ["Transition to arabica cultivation", "Join coffee farmer associations", "Access international buyer contracts"],
        sourceName: "Vietnam Coffee & Cocoa Association",
        sourceUrl: "https://www.vicacao.org.vn/"
      },
      {
        title: "Mekong Delta Aquaculture Modernization Accelerates",
        summary: "Government subsidies drive adoption of shrimp and fish farming technologies; productivity gains reach 40% in pilot provinces.",
        articleBody: "### Aquaculture Innovation\nModern hatcheries and integrated pest management systems are transforming the Mekong Delta. Farmer productivity is rising significantly.\n\n### Market Access\nExport-grade aquaculture production opens premium markets in Japan and Europe. Investment in modernization pays off quickly.",
        riskLevel: "Low",
        actions: ["Upgrade aquaculture systems", "Obtain aquaculture certifications", "Join aquafarmer networks"],
        sourceName: "Vietnam Fisheries Association",
        sourceUrl: "https://www.vietfish.org/"
      },
      {
        title: "Dragon Fruit (Pitaya) Production Becomes Second-Largest Export Crop",
        summary: "Dragon fruit cultivation reaches 100,000 hectares across southern Vietnam; export volumes surge 85% year-over-year.",
        articleBody: "### Explosive Growth\nDragon fruit has become a major export commodity. Global demand is strong, particularly from China and Southeast Asian markets.\n\n### Farmer Success\nSmallholders growing dragon fruit are earning 3-5x more than traditional rice cultivation. Production techniques are well-established.",
        riskLevel: "Low",
        actions: ["Invest in dragon fruit plantation", "Learn modern cultivation techniques", "Access export market networks"],
        sourceName: "Vietnamese Ministry of Agriculture",
        sourceUrl: "https://www.mard.gov.vn/"
      }
    ],
    global: [
      {
        title: "China Increases Agricultural Imports from Vietnam",
        summary: "Trade normalization drives Chinese demand for Vietnamese fresh produce; prices stabilize at favorable levels for producers.",
        articleBody: "### Market Expansion\nChina is increasing agricultural imports from Vietnam. This represents the largest market opportunity for Vietnamese farmers.\n\n### Price Stability\nChinese demand provides price stability and predictable market access for Vietnamese export products.",
        riskLevel: "Low",
        actions: ["Focus on Chinese market exports", "Meet Chinese quality standards", "Develop export supply chains"],
        sourceName: "Vietnam Chamber of Commerce",
        sourceUrl: "https://www.vcci.com.vn/"
      },
      {
        title: "Global Climate-Smart Agriculture Investment Increases",
        summary: "World Bank and Asian Development Bank launch new funding for climate-resilient farming in Vietnam; grants available.",
        articleBody: "### Funding Opportunity\nInternational development banks are providing substantial funding for climate adaptation agriculture in Vietnam.\n\n### Farmer Benefits\nSmallholders can access grants and low-interest loans for climate-smart infrastructure investments.",
        riskLevel: "Low",
        actions: ["Apply for climate adaptation grants", "Invest in water management", "Adopt sustainable practices"],
        sourceName: "World Bank Agriculture Division",
        sourceUrl: "https://www.worldbank.org/"
      }
    ]
  },
  SG: {
    local: [
      {
        title: "Singapore Urban Farming Initiative Hits 600 Vertical Farms Milestone",
        summary: "Government-backed vertical farming expansion achieves local food self-sufficiency targets; imports decline 12% in 2025.",
        articleBody: "### Urban Agriculture\nSingapore's vertical farming industry is rapidly scaling. Government incentives have created 6,000+ new jobs in agritech.\n\n### Food Security\nLocal production now supplies 30% of vegetables. Target is 60% by 2030.",
        riskLevel: "Low",
        actions: ["Invest in vertical farming technology", "Join Singapore AgTech ecosystem", "Access government grants"],
        sourceName: "Singapore Food Authority",
        sourceUrl: "https://www.sfa.gov.sg/"
      },
      {
        title: "Singapore-Malaysia Agricultural Cooperation Deepens",
        summary: "Cross-border farming initiatives expand; Singapore investors support Malaysian smallholders with technology and market access.",
        articleBody: "### Regional Integration\nSingapore is investing heavily in Malaysian agriculture to secure supply chains. Technology transfer and farmer training are ongoing.\n\n### Market Access\nMalaysian farmers benefit from Singapore's demand and investment in modernization.",
        riskLevel: "Low",
        actions: ["Explore Singapore partnership opportunities", "Learn vertical farming tech", "Access Singapore premium markets"],
        sourceName: "Singapore Economic Development Board",
        sourceUrl: "https://www.edb.gov.sg/"
      },
      {
        title: "Aquaponics Research Center Launches Commercial Training Programs",
        summary: "National University of Singapore opens commercial aquaponics facility for farmer and entrepreneur training; scholarships available.",
        articleBody: "### Innovation Hub\nNUS's aquaponics center is developing next-generation sustainable farming systems. Training programs are open to regional farmers.\n\n### Competitive Advantage\nFarmers trained in aquaponics gain significant productivity advantages.",
        riskLevel: "Low",
        actions: ["Enroll in aquaponics training", "Learn NUS farming systems", "Access research partnerships"],
        sourceName: "National University of Singapore",
        sourceUrl: "https://www.nus.edu.sg/"
      }
    ],
    global: [
      {
        title: "Global Agritech Investment Boom Continues Through 2026",
        summary: "Venture capital flowing into Southeast Asian agritech; Singapore emerges as regional hub for agricultural innovation funding.",
        articleBody: "### Investment Surge\nSingapore-based venture firms are investing heavily in ASEAN agritech startups. Billions in capital are flowing into the sector.\n\n### Opportunity\nFarmers and agritech entrepreneurs have unprecedented access to funding for innovation.",
        riskLevel: "Low",
        actions: ["Pitch agritech solutions", "Access VC funding networks", "Join startup accelerators"],
        sourceName: "Singapore VC Association",
        sourceUrl: "https://www.svca.sg/"
      },
      {
        title: "World Economic Forum Designates Singapore as Agritech Capital of Asia",
        summary: "WEF recognition accelerates investment and talent migration; Singapore cements leadership in agricultural technology innovation.",
        articleBody: "### Regional Recognition\nSingapore's agritech ecosystem is now the leading hub in Asia. Global companies are establishing regional centers there.\n\n### Ripple Effect\nThe entire ASEAN region benefits from Singapore's innovation leadership and knowledge sharing.",
        riskLevel: "Low",
        actions: ["Partner with Singapore firms", "Access regional networks", "Join WEF agritech initiatives"],
        sourceName: "World Economic Forum",
        sourceUrl: "https://www.weforum.org/"
      }
    ]
  },
  MM: {
    local: [
      {
        title: "Myanmar Rice Cultivation Recovers After Political Transitions",
        summary: "Agricultural sector stabilization allows farmers to resume modern cultivation practices; government support programs restart.",
        articleBody: "### Sector Recovery\nMyanmar's agriculture is bouncing back with renewed government support. Rice farmers are accessing improved seeds and training.\n\n### Market Opportunity\nMyanmar rice is competitive in regional markets. Stable production benefits ASEAN food security.",
        riskLevel: "Moderate",
        actions: ["Access government support programs", "Join farmer associations", "Adopt improved rice varieties"],
        sourceName: "Myanmar Agriculture Ministry",
        sourceUrl: "https://www.moai.gov.mm/"
      },
      {
        title: "Rubber Plantation Expansion Supports Rural Development",
        summary: "Government land allocation program supports rural communities through rubber cultivation; income prospects improve for smallholders.",
        articleBody: "### Rural Economy\nRubber farming offers sustainable income for rural Myanmar communities. Government support includes technical training.\n\n### Long-term Value\nRubber provides reliable, long-term income for smallholders.",
        riskLevel: "Low",
        actions: ["Apply for rubber land allocation", "Join rubber farmer groups", "Access technical training"],
        sourceName: "Myanmar Rubber Development Association",
        sourceUrl: "https://www.mrda.org.mm/"
      },
      {
        title: "Pulses Export Market Grows; Chickpea Prices Rise",
        summary: "Myanmar's chickpea and pulses exports surge as Indian demand strengthens; farmer prices improve significantly.",
        articleBody: "### Export Boom\nMyanmar's pulses are finding strong markets in India and globally. Prices are favorable for farmers.\n\n### Farmer Advantage\nPulses cultivation offers good returns and stable markets.",
        riskLevel: "Low",
        actions: ["Grow chickpea and pulses", "Join export networks", "Access buyer contracts"],
        sourceName: "Myanmar Trade Ministry",
        sourceUrl: "https://www.mmtrade.gov.mm/"
      }
    ],
    global: [
      {
        title: "Global Pulses Demand Remains Strong Through 2026",
        summary: "Indian and global demand for chickpea and lentils supports Myanmar producer prices; market outlook positive.",
        articleBody: "### Market Strength\nGlobal pulses demand is strong. Myanmar is well-positioned as a major supplier.\n\n### Pricing Advantage\nFarmers benefit from favorable global pulses pricing.",
        riskLevel: "Low",
        actions: ["Increase pulses cultivation", "Monitor global pulses market", "Secure export contracts"],
        sourceName: "International Legume Council",
        sourceUrl: "https://www.ilcouncil.org/"
      },
      {
        title: "ASEAN Trade Integration Benefits Myanmar Agricultural Exports",
        summary: "ASEAN tariff reductions boost Myanmar's agricultural exports to regional neighbors; market access improves.",
        articleBody: "### Regional Trade\nMyanmar farmers benefit from ASEAN trade agreements. Regional markets are opening up.\n\n### Export Opportunity\nASEAN trade integration provides new market outlets for Myanmar products.",
        riskLevel: "Low",
        actions: ["Explore ASEAN markets", "Meet regional quality standards", "Join trade networks"],
        sourceName: "ASEAN Secretariat",
        sourceUrl: "https://www.aseanregional.org/"
      }
    ]
  },
  LA: {
    local: [
      {
        title: "Laos Coffee Production Expands Across Bolaven Plateau",
        summary: "Coffee cultivation accelerates in southern Laos; international buyers establish direct relationships with farmer cooperatives.",
        articleBody: "### Coffee Growth\nLaos is becoming a significant coffee producer. The Bolaven Plateau offers ideal conditions for quality coffee cultivation.\n\n### Buyer Interest\nInternational specialty coffee buyers are targeting Lao producers. Direct trade relationships are strengthening.",
        riskLevel: "Low",
        actions: ["Invest in coffee cultivation", "Join coffee cooperatives", "Access international buyers"],
        sourceName: "Laos Ministry of Agriculture",
        sourceUrl: "https://www.moaf.gov.la/"
      },
      {
        title: "Mekong River Fisheries Management Improves Resource Sustainability",
        summary: "Regional cooperation enhances fish population management; catches stabilize and aquaculture investment grows.",
        articleBody: "### Fisheries Management\nImproved regional cooperation is benefiting the Mekong's fish populations. Sustainability is improving.\n\n### Farmer Opportunity\nAquaculture investment is becoming more viable as wild fisheries become more stable.",
        riskLevel: "Low",
        actions: ["Join aquaculture programs", "Adopt sustainable fishing", "Access farmer training"],
        sourceName: "Mekong River Commission",
        sourceUrl: "https://www.mrcmekong.org/"
      },
      {
        title: "Sticky Rice Production Reaches New Quality Standards",
        summary: "Government quality certification program elevates Lao sticky rice brand in international markets; export premiums increase.",
        articleBody: "### Brand Development\nLao sticky rice is gaining international recognition for quality. Premiums are rising in global markets.\n\n### Farmer Benefit\nSmallholders benefit from higher prices for certified quality rice.",
        riskLevel: "Low",
        actions: ["Achieve quality certification", "Join rice farmer associations", "Access premium export markets"],
        sourceName: "Laos Agriculture Department",
        sourceUrl: "https://www.moaf.gov.la/"
      }
    ],
    global: [
      {
        title: "Global Organic Certification Demand Creates Opportunity for Laos",
        summary: "International organic certification market expansion benefits Laos's traditional low-input farming practices.",
        articleBody: "### Organic Advantage\nLaos's traditional farming is naturally suited for organic certification. International premiums are strong.\n\n### Market Access\nOrganic certification opens premium global markets.",
        riskLevel: "Low",
        actions: ["Pursue organic certification", "Join organic networks", "Access premium markets"],
        sourceName: "International Organic Federation",
        sourceUrl: "https://www.ifoam.bio/"
      },
      {
        title: "Southeast Asian Coffee Market Consolidation Benefits Quality Producers",
        summary: "Premium coffee markets reward quality; Laos positioned to compete with higher-grade production standards.",
        articleBody: "### Market Consolidation\nSpecialty coffee market is rewarding quality producers. Laos can compete effectively.\n\n### Competition Edge\nInvest in quality over volume for better margins.",
        riskLevel: "Low",
        actions: ["Improve coffee quality standards", "Invest in processing equipment", "Target specialty coffee buyers"],
        sourceName: "International Coffee Organization",
        sourceUrl: "https://www.ico.org/"
      }
    ]
  },
  KH: {
    local: [
      {
        title: "Cambodia Cassava Production Boosts Industrial Starch Exports",
        summary: "Cassava cultivation expansion drives industrial starch production; export revenues reach new highs for agricultural sector.",
        articleBody: "### Industrial Growth\nCassava is becoming Cambodia's industrial agricultural backbone. Starch factories are expanding rapidly.\n\n### Farmer Opportunity\nCassava contract farming provides predictable income for smallholders. Demand is steady and prices are rising.",
        riskLevel: "Low",
        actions: ["Join cassava contract farming", "Learn cassava cultivation", "Access industrial buyer networks"],
        sourceName: "Cambodia Agricultural Ministry",
        sourceUrl: "https://www.maff.gov.kh/"
      },
      {
        title: "Tonlé Sap Floating Villages Adopt Sustainable Fisheries",
        summary: "Community-based fisheries management protects spawning grounds; fish stocks recover, supporting traditional livelihoods.",
        articleBody: "### Fisheries Sustainability\nTonlé Sap fisheries are recovering thanks to conservation efforts. Traditional fishing communities are seeing improved catches.\n\n### Long-term Benefit\nSustainable management ensures fisheries viability for future generations.",
        riskLevel: "Low",
        actions: ["Join sustainable fisheries programs", "Adopt conservation practices", "Access fishing community networks"],
        sourceName: "Cambodia Fisheries Administration",
        sourceUrl: "https://www.fis.gov.kh/"
      },
      {
        title: "Pepper Cultivation Revives in Kampot and Kep Provinces",
        summary: "Pepper farming heritage is experiencing renaissance; geographic indication certification boosts international demand.",
        articleBody: "### Heritage Crops\nCambodian pepper is gaining international recognition. Geographic indication certification commands premium prices.\n\n### Farmer Revival\nTraditional pepper farming families are thriving again. Global specialty markets value Kampot and Kep peppers.",
        riskLevel: "Low",
        actions: ["Plant pepper gardens", "Pursue GI certification", "Access specialty export markets"],
        sourceName: "Cambodia Ministry of Commerce",
        sourceUrl: "https://www.moc.gov.kh/"
      }
    ],
    global: [
      {
        title: "Global Starch Market Expands with Industrial Demand",
        summary: "Industrial starch demand grows globally; Cambodia positioned as cost-competitive cassava starch producer.",
        articleBody: "### Market Growth\nGlobal starch demand is growing. Cambodia's cassava starch is cost-competitive.\n\n### Producer Advantage\nCambodia can capture market share in growing industrial starch sector.",
        riskLevel: "Low",
        actions: ["Increase cassava starch production", "Improve product quality", "Access global industrial buyers"],
        sourceName: "International Starch Council",
        sourceUrl: "https://www.starch.org/"
      },
      {
        title: "Asian Agricultural Trade Normalization Benefits Cambodia Exports",
        summary: "Regional trade agreements open market access; Cambodia agricultural exports gain momentum in regional markets.",
        articleBody: "### Trade Opening\nCambodia is benefiting from regional trade liberalization. Export markets are expanding.\n\n### Opportunity\nCambodian farmers have increasing access to regional markets.",
        riskLevel: "Low",
        actions: ["Explore regional export markets", "Meet quality standards", "Join trade networks"],
        sourceName: "ASEAN Secretariat",
        sourceUrl: "https://www.aseanregional.org/"
      }
    ]
  },
  BN: {
    local: [
      {
        title: "Brunei Agro-Tourism Boosts Farm Incomes for Smallholders",
        summary: "Government-backed agro-tourism initiative converts traditional farms into educational and recreational destinations; income streams diversify.",
        articleBody: "### Diversification Strategy\nBrunei's small farming community is leveraging agro-tourism to supplement income. Visitors are eager to experience traditional farming.\n\n### Income Growth\nSmallholders are earning significant income from on-farm educational activities and farm stays.",
        riskLevel: "Low",
        actions: ["Register for agro-tourism program", "Develop on-farm facilities", "Market to tourist networks"],
        sourceName: "Brunei Ministry of Primary Resources",
        sourceUrl: "https://www.mpr.gov.bn/"
      },
      {
        title: "Organic Vegetable Cultivation Gains Government Support",
        summary: "Food import reduction initiative supports local organic vegetable farming; government purchases support producer prices.",
        articleBody: "### Local Production\nBrunei is reducing agricultural imports through domestic organic vegetable production. Government procurement supports prices.\n\n### Farmer Benefit\nLocal vegetable farmers have guaranteed markets through government supply contracts.",
        riskLevel: "Low",
        actions: ["Convert to organic vegetable farming", "Join government supply programs", "Obtain organic certification"],
        sourceName: "Brunei Food Authority",
        sourceUrl: "https://www.food.gov.bn/"
      },
      {
        title: "Aquaculture Development Zone Established in Temburong District",
        summary: "Government invests in aquaculture infrastructure; training and financing available for fish and shrimp farming ventures.",
        articleBody: "### Aquaculture Growth\nBrunei is developing aquaculture capacity in Temburong District. Infrastructure investment supports farmer development.\n\n### Opportunity\nSmallholders can enter fish and shrimp farming with government support.",
        riskLevel: "Low",
        actions: ["Apply for aquaculture training", "Access financing programs", "Join aquaculture networks"],
        sourceName: "Brunei Economic Development Board",
        sourceUrl: "https://www.bedb.gov.bn/"
      }
    ],
    global: [
      {
        title: "Global Organic Produce Market Expands in Developed Asian Markets",
        summary: "Organic produce demand surges among affluent ASEAN consumers; Brunei positioned for premium organic exports.",
        articleBody: "### Premium Market\nOrganic produce is commanding premium prices in developed Asian markets. Brunei producers can compete effectively.\n\n### Market Niche\nSmall scale, high quality, premium-priced organic products suit Brunei's farming model.",
        riskLevel: "Low",
        actions: ["Focus on premium organic production", "Target affluent Asian markets", "Build organic brand"],
        sourceName: "Global Organic Market Research",
        sourceUrl: "https://www.organicmarket.org/"
      },
      {
        title: "Sustainable Agriculture Certification Becomes Standard in Premium Markets",
        summary: "Sustainability certifications are increasingly required for premium market access; Brunei farmers can differentiate through early adoption.",
        articleBody: "### Certification Advantage\nEarly adoption of sustainability standards gives Brunei farmers competitive advantage in premium markets.\n\n### Brand Value\nSustainability certification supports higher prices and market differentiation.",
        riskLevel: "Low",
        actions: ["Pursue sustainability certification", "Adopt climate-smart practices", "Target premium buyers"],
        sourceName: "International Sustainable Agriculture Alliance",
        sourceUrl: "https://www.isaa.org/"
      }
    ]
  }
}

export default function NewsPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [groqKey, setGroqKey] = React.useState<string | null>(null)
  const [countryCode, setCountryCode] = React.useState<string>("MY")
  const [localArticles, setLocalArticles] = React.useState<NewsAnalysisOutput[]>([])
  const [globalArticles, setGlobalArticles] = React.useState<NewsAnalysisOutput[]>([])
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [activeArticle, setActiveArticle] = React.useState<NewsAnalysisOutput | null>(null)

  // Load configuration and cached news
  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let currentCountry = "MY"
      let currentKey = null

      if (user) {
        const { data: profile } = await supabase.from('users').select('geminiApiKey, countryCode').eq('id', user.id).single()
        if (profile?.geminiApiKey) {
          currentKey = profile.geminiApiKey
          setGroqKey(currentKey)
        }
        if (profile?.countryCode) {
          currentCountry = profile.countryCode
          setCountryCode(currentCountry)
        }
      }

      setMounted(true)
      loadCachedNews(currentCountry)
    }
    init()
  }, [])

  const loadCachedNews = (country: string) => {
    const today = new Date().toISOString().split('T')[0]
    const localKey = `tuai_news_local_${country}_${today}`
    const globalKey = `tuai_news_global_${today}`

    const cachedLocal = localStorage.getItem(localKey)
    const cachedGlobal = localStorage.getItem(globalKey)

    if (cachedLocal) {
      setLocalArticles(JSON.parse(cachedLocal))
    } else {
      // Use country-specific mockup data
      const countryData = NEWS_BY_COUNTRY[country]
      if (countryData) {
        setLocalArticles(countryData.local)
      } else {
        setLocalArticles([])
      }
    }

    if (cachedGlobal) {
      setGlobalArticles(JSON.parse(cachedGlobal))
    } else {
      // Use country-specific mockup data for global
      const countryData = NEWS_BY_COUNTRY[country]
      if (countryData) {
        setGlobalArticles(countryData.global)
      } else {
        setGlobalArticles([])
      }
    }
  }

  // Re-load news when country changes
  React.useEffect(() => {
    if (mounted) {
      loadCachedNews(countryCode)
    }
  }, [countryCode, mounted])

  const handleRefresh = async (category: 'local' | 'global') => {
    const activeKey = groqKey || process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!activeKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Add your Groq API Key in Settings to generate fresh AI intelligence."
      })
      return
    }

    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    try {
      const results = await generateNewsBatch({
        category,
        countryCode,
        count: 5,
        apiKey: activeKey
      })

      if (category === 'local') {
        setLocalArticles(results)
        localStorage.setItem(`tuai_news_local_${countryCode}_${today}`, JSON.stringify(results))
      } else {
        setGlobalArticles(results)
        localStorage.setItem(`tuai_news_global_${today}`, JSON.stringify(results))
      }

      toast({ title: "Intelligence Refreshed", description: `Successfully generated ${category} news batch.` })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not fetch news updates at this time." })
    } finally {
      setLoading(false)
    }
  }

  const riskColors = {
    Low: "bg-emerald-500",
    Moderate: "bg-yellow-500",
    High: "bg-orange-500",
    Critical: "bg-destructive"
  }

  const NewsCard = ({ article }: { article: NewsAnalysisOutput }) => (
    <Card
      className="rounded-2xl sm:rounded-[2rem] border-none shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-2xl transition-all group overflow-hidden bg-white cursor-pointer flex flex-col h-full"
      onClick={() => setActiveArticle(article)}
    >
      <div className={cn("h-1 sm:h-1.5 w-full", riskColors[article.riskLevel as keyof typeof riskColors] || "bg-primary")} />
      <CardHeader className="pb-2 p-4 sm:p-6 flex-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className={cn(
            "px-2.5 sm:px-3 py-1 rounded-full text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5",
            riskColors[article.riskLevel as keyof typeof riskColors] || "bg-primary"
          )}>
            <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {article.riskLevel} Risk
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase truncate max-w-[100px] sm:max-w-[80px]">{article.sourceName || 'AI Feed'}</span>
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-300" />
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 flex-grow">
        <p className="text-[12px] sm:text-xs text-muted-foreground leading-relaxed font-medium line-clamp-3">
          {article.summary}
        </p>
      </CardContent>
      <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
          Read Dossier <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </div>
        {article.sourceUrl && (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[8px] sm:text-[9px] font-black text-slate-400 hover:text-primary underline uppercase tracking-tighter"
          >
            Source
          </a>
        )}
      </CardFooter>
    </Card>
  )

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 sm:h-10 w-8 sm:w-10 animate-spin text-primary opacity-30" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Loading Intel...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit">
            <Newspaper className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Strategic Intelligence
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-headline font-bold text-slate-900 leading-tight">News Dashboard</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 font-medium">
              Country: <span className="font-bold text-slate-700">{COUNTRY_NAMES[countryCode] || countryCode}</span> • AI-powered insights from regional and global markets
            </p>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {!groqKey && !process.env.NEXT_PUBLIC_GROQ_API_KEY && (
        <Alert className="bg-blue-50 border-blue-100 rounded-xl sm:rounded-[2rem] shadow-sm p-4 sm:p-6">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 font-bold ml-2 text-sm sm:text-base">Using Mockup Intelligence</AlertTitle>
          <AlertDescription className="text-blue-800 text-xs sm:text-sm ml-2 leading-relaxed mt-1">
            To unlock daily automated AI-generated news, add your Groq API Key in <Link href="/dashboard/settings" className="underline font-bold">Settings</Link>.
            Currently showing {COUNTRY_NAMES[countryCode]}-specific sample data.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="local" className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-100 rounded-xl sm:rounded-[2rem]">
          <TabsList className="bg-transparent h-auto p-0 gap-1.5 sm:gap-2 w-full sm:w-auto">
            <TabsTrigger value="local" className="flex-1 sm:flex-none rounded-lg sm:rounded-[1.5rem] px-4 sm:px-8 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg sm:data-[state=active]:shadow-xl font-bold text-xs sm:text-sm">
              Local Intel
            </TabsTrigger>
            <TabsTrigger value="global" className="flex-1 sm:flex-none rounded-lg sm:rounded-[1.5rem] px-4 sm:px-8 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg sm:data-[state=active]:shadow-xl font-bold text-xs sm:text-sm">
              Global Trends
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none h-10 sm:h-12 rounded-lg sm:rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all font-bold text-xs"
              onClick={() => handleRefresh("local")}
              disabled={loading}
              size="sm"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Update Local
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none h-10 sm:h-12 rounded-lg sm:rounded-2xl bg-white border-none shadow-sm hover:shadow-md transition-all font-bold text-xs"
              onClick={() => handleRefresh("global")}
              disabled={loading}
              size="sm"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Update Global
            </Button>
          </div>
        </div>

        {/* Local Tab */}
        <TabsContent value="local" className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {localArticles.length > 0 ? (
              localArticles.map((art, idx) => <NewsCard key={idx} article={art} />)
            ) : (
              <div className="col-span-full py-12 sm:py-20 text-center space-y-4">
                <div className="h-16 sm:h-20 w-16 sm:w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
                  <Zap className="h-8 sm:h-10 w-8 sm:w-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[9px] sm:text-[10px]">No localized intel for today</p>
                <Button variant="link" onClick={() => handleRefresh("local")} className="text-primary font-bold text-xs">Try Generating Now</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Global Tab */}
        <TabsContent value="global" className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {globalArticles.length > 0 ? (
              globalArticles.map((art, idx) => <NewsCard key={idx} article={art} />)
            ) : (
              <div className="col-span-full py-12 sm:py-20 text-center space-y-4">
                <div className="h-16 sm:h-20 w-16 sm:w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
                  <Globe className="h-8 sm:h-10 w-8 sm:w-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[9px] sm:text-[10px]">No global trends for today</p>
                <Button variant="link" onClick={() => handleRefresh("global")} className="text-primary font-bold text-xs">Try Generating Now</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Intelligence Dossier Dialog */}
      <Dialog open={!!activeArticle} onOpenChange={(open) => !open && setActiveArticle(null)}>
        <DialogContent className="max-w-3xl rounded-2xl sm:rounded-[2.5rem] bg-white p-0 overflow-hidden border-none shadow-2xl max-h-[90vh]">
          {activeArticle && (
            <div className="max-h-[90vh] overflow-y-auto">
              <div className={cn("h-3 sm:h-4 w-full", riskColors[activeArticle.riskLevel as keyof typeof riskColors] || "bg-primary")} />
              <div className="p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
                <DialogHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      Intelligence Brief • {new Date().toLocaleDateString()}
                    </div>
                    <div className={cn(
                      "px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 whitespace-nowrap",
                      riskColors[activeArticle.riskLevel as keyof typeof riskColors] || "bg-primary"
                    )}>
                      <AlertTriangle className="h-3 w-3" />
                      {activeArticle.riskLevel} Risk
                    </div>
                  </div>
                  <DialogTitle className="text-2xl sm:text-4xl lg:text-5xl font-headline font-bold text-slate-900 leading-tight">
                    {activeArticle.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-lg lg:text-xl font-medium text-slate-500 mt-6 sm:mt-8 leading-relaxed border-l-4 border-primary/20 pl-4 sm:pl-6 italic">
                    {activeArticle.summary}
                  </DialogDescription>
                </DialogHeader>

                <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-loose text-sm sm:text-base lg:text-lg py-6 sm:py-8 space-y-4">
                  {activeArticle.articleBody.split('\n').map((line, i) => (
                    line.trim() && <p key={i}>{line.replace(/#/g, '').trim()}</p>
                  ))}
                </div>

                <div className="p-5 sm:p-8 lg:p-10 rounded-xl sm:rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 sm:space-y-8">
                  <h4 className="font-headline font-bold text-lg sm:text-2xl flex items-center gap-2 sm:gap-3 text-primary">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-secondary fill-current" />
                    Tactical Strategy
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {activeArticle.actions.map((action, i) => (
                      <div key={i} className="flex gap-4 sm:gap-5 p-4 sm:p-6 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-100 items-start">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs sm:text-sm">
                          {i + 1}
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500" /> Grounded via {activeArticle.sourceName || 'AI Analysis'}
                    </span>
                    {activeArticle.sourceUrl && (
                      <a
                        href={activeArticle.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] sm:text-[10px] font-black text-primary underline truncate max-w-xs"
                      >
                        {activeArticle.sourceUrl}
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" className="text-slate-500 font-bold text-xs hover:bg-slate-100 rounded-lg sm:rounded-xl" onClick={() => setActiveArticle(null)}>
                    Close Dossier
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}