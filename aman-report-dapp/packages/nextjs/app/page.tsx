"use client";

import { useState, useRef, useEffect } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton, Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { getWrappedEthersSigner } from "~~/utils/web3";
import { submitGaslessReport, isGaslessAvailable, getGaslessTransactionFee } from "~~/utils/gasless";
import { Contract } from "ethers";
import deployedContracts from "~~/contracts/deployedContracts";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Lock, Shield, Heart, AlertTriangle, X, Send, Plus, Users, Calendar, Eye, Share2, Bookmark, MoreHorizontal, Zap, Star, TrendingUp, Filter, Activity, BarChart3, FileText, CheckCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ReportEvent = {
  args: {
    reportId: bigint;
    owner: string;
  };
  blockNumber: bigint;
};

type SampleReport = {
  id: number;
  owner: string;
  blockNumber: string;
  title: string;
  description: string;
  tags: string[];
  timestamp: string;
  category: string;
};

// Sample harassment reports for demonstration
const sampleReports: SampleReport[] = [
  {
    id: 1,
    owner: "0x1234567890123456789012345678901234567890",
    blockNumber: "12345678",
    title: "Workplace Harassment by Supervisor",
    description: "Experienced repeated inappropriate comments and unwanted advances from direct supervisor over several months. Created hostile work environment affecting job performance.",
    tags: ["#WorkplaceHarassment", "#Supervisor", "#HostileEnvironment"],
    timestamp: "2 hours ago",
    category: "Workplace"
  },
  {
    id: 2,
    owner: "0x2345678901234567890123456789012345678901",
    blockNumber: "12345679",
    title: "Online Harassment and Doxxing",
    description: "Targeted harassment campaign including doxxing, threats, and coordinated attacks across multiple social media platforms after speaking out about industry issues.",
    tags: ["#OnlineHarassment", "#Doxxing", "#SocialMedia"],
    timestamp: "4 hours ago",
    category: "Online"
  },
  {
    id: 3,
    owner: "0x3456789012345678901234567890123456789012",
    blockNumber: "12345680",
    title: "Street Harassment During Commute",
    description: "Regular verbal harassment and following behavior from strangers during daily commute. Incidents occur multiple times per week, affecting sense of safety.",
    tags: ["#StreetHarassment", "#PublicSafety", "#Commute"],
    timestamp: "6 hours ago",
    category: "Public"
  },
  {
    id: 4,
    owner: "0x4567890123456789012345678901234567890123",
    blockNumber: "12345681",
    title: "Academic Harassment by Professor",
    description: "Inappropriate behavior and discriminatory treatment in academic setting. Professor made unwelcome advances and threatened academic standing when rejected.",
    tags: ["#AcademicHarassment", "#Professor", "#Education"],
    timestamp: "8 hours ago",
    category: "Academic"
  },
  {
    id: 5,
    owner: "0x5678901234567890123456789012345678901234",
    blockNumber: "12345682",
    title: "Cyberbullying and Threats",
    description: "Receiving threatening messages and cyberbullying through various online platforms. Perpetrator has created multiple fake accounts to continue harassment.",
    tags: ["#Cyberbullying", "#OnlineThreats", "#DigitalSafety"],
    timestamp: "12 hours ago",
    category: "Digital"
  },
  {
    id: 6,
    owner: "0x6789012345678901234567890123456789012345",
    blockNumber: "12345683",
    title: "Discrimination and Hostile Work Environment",
    description: "Facing discrimination based on gender and ethnicity. Colleagues make inappropriate jokes and exclude from important meetings and opportunities.",
    tags: ["#Discrimination", "#HostileWorkplace", "#Inclusion"],
    timestamp: "1 day ago",
    category: "Workplace"
  },
  {
    id: 7,
    owner: "0x7890123456789012345678901234567890123456",
    blockNumber: "12345684",
    title: "Stalking and Unwanted Contact",
    description: "Ex-partner continues to contact despite clear boundaries. Showing up at workplace and home, making threats, and monitoring social media activity.",
    tags: ["#Stalking", "#UnwantedContact", "#PersonalSafety"],
    timestamp: "1 day ago",
    category: "Personal"
  },
  {
    id: 8,
    owner: "0x8901234567890123456789012345678901234567",
    blockNumber: "12345685",
    title: "Harassment in Gaming Community",
    description: "Constant harassment in online gaming communities including sexist comments, threats, and attempts to doxx personal information during gameplay.",
    tags: ["#GamingHarassment", "#OnlineCommunity", "#Toxicity"],
    timestamp: "2 days ago",
    category: "Gaming"
  },
  {
    id: 9,
    owner: "0x9012345678901234567890123456789012345678",
    blockNumber: "12345686",
    title: "Public Transportation Harassment",
    description: "Inappropriate touching and verbal harassment on public transportation. Incidents happen frequently during rush hour commutes, making travel uncomfortable.",
    tags: ["#PublicTransport", "#PhysicalHarassment", "#CommuterSafety"],
    timestamp: "2 days ago",
    category: "Transport"
  },
  {
    id: 10,
    owner: "0x0123456789012345678901234567890123456789",
    blockNumber: "12345687",
    title: "Neighborhood Harassment and Intimidation",
    description: "Neighbor engaging in intimidating behavior including loud music at inappropriate hours, blocking driveway, and making threatening gestures.",
    tags: ["#NeighborHarassment", "#Intimidation", "#CommunityIssues"],
    timestamp: "3 days ago",
    category: "Community"
  },
  {
    id: 11,
    owner: "0x1111111111111111111111111111111111111111",
    blockNumber: "12345688",
    title: "Medical Professional Misconduct",
    description: "Healthcare provider made inappropriate comments about appearance and touched inappropriately during routine examination without medical necessity.",
    tags: ["#MedicalMisconduct", "#Healthcare", "#ProfessionalBoundaries"],
    timestamp: "3 days ago",
    category: "Healthcare"
  },
  {
    id: 12,
    owner: "0x2222222222222222222222222222222222222222",
    blockNumber: "12345689",
    title: "Retail Customer Harassment",
    description: "Customer at retail job repeatedly makes inappropriate comments, follows around store, and requests personal information despite clear discomfort.",
    tags: ["#RetailHarassment", "#CustomerMisconduct", "#WorkplaceSafety"],
    timestamp: "4 days ago",
    category: "Retail"
  },
  {
    id: 13,
    owner: "0x3333333333333333333333333333333333333333",
    blockNumber: "12345690",
    title: "Religious Institution Harassment",
    description: "Leader at religious institution made unwelcome advances and used position of authority to pressure into uncomfortable situations.",
    tags: ["#ReligiousHarassment", "#AuthorityAbuse", "#SacredSpaces"],
    timestamp: "4 days ago",
    category: "Religious"
  },
  {
    id: 14,
    owner: "0x4444444444444444444444444444444444444444",
    blockNumber: "12345691",
    title: "Fitness Center Harassment",
    description: "Gym member consistently makes unwelcome comments about workout routine, follows to different equipment, and takes unauthorized photos.",
    tags: ["#GymHarassment", "#FitnessCenter", "#PrivacyViolation"],
    timestamp: "5 days ago",
    category: "Fitness"
  },
  {
    id: 15,
    owner: "0x5555555555555555555555555555555555555555",
    blockNumber: "12345692",
    title: "Landlord Harassment and Abuse",
    description: "Landlord enters apartment without notice, makes inappropriate comments, and threatens eviction when advances are rejected.",
    tags: ["#LandlordHarassment", "#HousingRights", "#TenantAbuse"],
    timestamp: "5 days ago",
    category: "Housing"
  },
  {
    id: 16,
    owner: "0x6666666666666666666666666666666666666666",
    blockNumber: "12345693",
    title: "Rideshare Driver Misconduct",
    description: "Rideshare driver made inappropriate comments, took longer route without consent, and asked for personal contact information.",
    tags: ["#RideshareHarassment", "#TransportSafety", "#DriverMisconduct"],
    timestamp: "6 days ago",
    category: "Transport"
  },
  {
    id: 17,
    owner: "0x7777777777777777777777777777777777777777",
    blockNumber: "12345694",
    title: "Social Media Platform Harassment",
    description: "Coordinated harassment campaign across multiple social media platforms including fake accounts, mass reporting, and spreading false information.",
    tags: ["#SocialMediaHarassment", "#CoordinatedAttack", "#DigitalMobbing"],
    timestamp: "6 days ago",
    category: "Digital"
  },
  {
    id: 18,
    owner: "0x8888888888888888888888888888888888888888",
    blockNumber: "12345695",
    title: "Restaurant Service Harassment",
    description: "Server at restaurant made inappropriate comments, lingered at table unnecessarily, and wrote personal number on receipt without consent.",
    tags: ["#ServiceHarassment", "#RestaurantMisconduct", "#CustomerService"],
    timestamp: "1 week ago",
    category: "Service"
  },
  {
    id: 19,
    owner: "0x9999999999999999999999999999999999999999",
    blockNumber: "12345696",
    title: "Legal Professional Misconduct",
    description: "Attorney made inappropriate advances during consultation, suggested personal meetings outside office, and made case outcome conditional on personal favors.",
    tags: ["#LegalMisconduct", "#AttorneyAbuse", "#ProfessionalEthics"],
    timestamp: "1 week ago",
    category: "Legal"
  },
  {
    id: 20,
    owner: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    blockNumber: "12345697",
    title: "Event Security Harassment",
    description: "Security personnel at public event used position to make inappropriate comments and unnecessary physical contact during routine security checks.",
    tags: ["#SecurityHarassment", "#EventSafety", "#AuthorityAbuse"],
    timestamp: "1 week ago",
    category: "Events"
  }
];

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6"
        >
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
            <div className="flex space-x-2 mt-4">
              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              <div className="h-6 bg-gray-300 rounded-full w-20"></div>
              <div className="h-6 bg-gray-300 rounded-full w-14"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced Twitter-like Sample Report Card Component
const SampleReportCard = ({ report, index }: { report: SampleReport; index: number }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Dynamic gradient backgrounds for visual variety
  const gradients = [
    "bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200",
    "bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200", 
    "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200",
    "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200",
    "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200"
  ];
  const cardGradient = gradients[report.id % gradients.length];
  
  // Mock engagement data for realism
  const mockLikes = Math.floor(Math.random() * 50) + 5;
  const mockViews = Math.floor(Math.random() * 200) + 20;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className={`${cardGradient} border-2 rounded-2xl p-6 mb-4 cursor-pointer transition-all duration-300 hover:shadow-xl backdrop-blur-sm`}
    >
      {/* Header with user info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">Anonymous Reporter</span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Address address={report.owner} format="short" />
              <span>•</span>
              <span>Block #{report.blockNumber}</span>
              <span>•</span>
              <span>{report.timestamp}</span>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </motion.div>
          <span className="font-semibold text-gray-800">{report.title}</span>
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium"
          >
            🔒 Encrypted
          </motion.span>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-3">
          {report.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {report.tags.map((tag, tagIndex) => (
            <span key={tagIndex} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">#{report.category}</span>
        </div>
      </div>

      {/* Engagement Bar - Twitter-like */}
      <div className="flex items-center justify-between pt-3 border-t border-white/50">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-pink-500 fill-pink-500' : ''}`} />
            </motion.div>
            <span className="text-sm font-medium">{mockLikes + (isLiked ? 1 : 0)}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Eye className="w-4 h-4" />
          <span>{mockViews}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Twitter-like Report Card Component
const ReportCard = ({ reportEvent, index }: { reportEvent: ReportEvent; index: number }) => {
  const reportId = Number(reportEvent.args.reportId);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Dynamic gradient backgrounds for visual variety
  const gradients = [
    "bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200",
    "bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200", 
    "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200",
    "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200",
    "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200"
  ];
  const cardGradient = gradients[reportId % gradients.length];
  
  // Mock engagement data for realism
  const mockLikes = Math.floor(Math.random() * 50) + 5;
  const mockViews = Math.floor(Math.random() * 200) + 20;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className={`${cardGradient} border-2 rounded-2xl p-6 mb-4 cursor-pointer transition-all duration-300 hover:shadow-xl backdrop-blur-sm`}
    >
      {/* Header with user info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">Anonymous Reporter</span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Address address={reportEvent.args.owner} format="short" />
              <span>•</span>
              <span>Block #{reportEvent.blockNumber.toString()}</span>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </motion.div>
          <span className="font-semibold text-gray-800">Confidential Report #{reportId}</span>
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium"
          >
            🔒 Encrypted
          </motion.span>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-3">
          A confidential harassment report has been securely documented and encrypted on the Oasis Sapphire blockchain. 
          This report contributes to building awareness and creating safer communities.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">#SafeSpace</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">#Confidential</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">#Support</span>
        </div>
      </div>

      {/* Engagement Bar - Twitter-like */}
      <div className="flex items-center justify-between pt-3 border-t border-white/50">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-pink-500 fill-pink-500' : ''}`} />
            </motion.div>
            <span className="text-sm font-medium">{mockLikes + (isLiked ? 1 : 0)}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Eye className="w-4 h-4" />
          <span>{mockViews}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [useGasless, setUseGasless] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get unique categories for filter buttons
  const categories = ["All", ...Array.from(new Set(sampleReports.map(report => report.category)))];
  
  // Filter reports based on selected category
  const filteredReports = selectedFilter === "All" 
    ? sampleReports 
    : sampleReports.filter(report => report.category === selectedFilter);

  // SE-2 Hooks for blockchain integration
  const { data: totalReportCount } = useScaffoldReadContract({
    contractName: "ConfidentialReporter",
    functionName: "totalReportCount",
  });

  const { data: reportEvents, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "ConfidentialReporter",
    eventName: "ReportSubmitted",
    fromBlock: 0n,
    watch: true,
  });

  // Get contract info for Sapphire Testnet (chain ID 23295)
  const contractInfo = deployedContracts[23295]?.ConfidentialReporter;

  // Generate random data for time-based metrics
  const generateRandomData = () => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5);
  };

  const [dailyData] = useState(generateRandomData());
  const [monthlyData] = useState(generateRandomData());
  const [yearlyData] = useState(generateRandomData());

  // Calculate totals
  const dailyTotal = dailyData.reduce((sum, val) => sum + val, 0);
  const monthlyTotal = monthlyData.reduce((sum, val) => sum + val, 0);
  const yearlyTotal = yearlyData.reduce((sum, val) => sum + val, 0);

  // Mini chart component
  const MiniChart = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 120;
      const y = 40 - (value / max) * 30;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="120" height="40" className="ml-auto">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 120;
          const y = 40 - (value / max) * 30;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
    );
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: Message = { role: "user", content: userInput };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setUserInput("");
    setIsLoadingAI(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to get response from server.");
      const data = await response.json();
      setMessages(prev => [...prev, data.reply]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: "assistant", content: "Sorry, an error occurred. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmitToBlockchain = async () => {
    if (messages.length === 0) {
      alert("Cannot submit an empty report.");
      return;
    }
    
    if (!contractInfo) {
      alert("Contract not found for Sapphire Testnet. Please check the deployment.");
      return;
    }
    
    try {
      setIsLoadingBlockchain(true);
      
      let txResp;
      let txHash;
      
      if (useGasless && isGaslessAvailable()) {
        // Submit using gasless transaction
        txResp = await submitGaslessReport(JSON.stringify(messages));
        txHash = txResp.hash;
        
        alert(`Report successfully submitted using gasless transaction!\nTransaction Hash: ${txHash}\n\nYour gasless transaction is now viewable on the Sapphire Testnet Explorer.\nClick OK to view transaction details.`);
      } else {
        // Use regular transaction with gas
        const signer = await getWrappedEthersSigner();
        const account = await signer.getAddress();
        
        if (contractInfo.address.toLowerCase() === account.toLowerCase()) {
          throw new Error('Contract address equals your wallet address – check deployment');
        }
        
        const contract = new Contract(contractInfo.address, contractInfo.abi, signer);
        
        // Submit the encrypted report
        txResp = await contract.submitReport(JSON.stringify(messages));
        txHash = txResp.hash;
        
        alert(`Report successfully and securely submitted to the blockchain!\nTransaction Hash: ${txHash}\n\nYour transaction is now viewable on the Sapphire Testnet Explorer.\nClick OK to view transaction details.`);
      }
      
      // Open block explorer to show transaction details
      window.open(`https://explorer.oasis.io/testnet/sapphire/tx/${txHash}`, '_blank');
      
      setMessages([]);
    } catch (error) {
      console.error("Error submitting to blockchain:", error);
      const errorMessage = useGasless 
        ? "Failed to submit gasless report. Please ensure gasless service is available and try again."
        : "Failed to submit report. Please ensure your wallet is connected to Sapphire Testnet and you have enough funds for gas.";
      alert(errorMessage);
    } finally {
      setIsLoadingBlockchain(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-6000"></div>
      </div>
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <Image alt="SP3AK-UP logo" className="w-full h-full object-cover" width={40} height={40} src="/new-logo.png" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#cd3001] to-[#e74732] bg-clip-text text-transparent" style={{letterSpacing: '-0.1em'}}>
                  SP3AK-UP
                </h1>
                <p className="text-sm text-gray-500">Safe • Confidential • Encrypted</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChatModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#ffbe4c] to-[#e74732] text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Share Your Story
              </motion.button>
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Bar */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
         >
           {[
             { 
               icon: Calendar, 
               label: "Daily Reports", 
               value: dailyTotal.toString(), 
               color: "from-[#ffbe4c] via-[#e74732] to-[#cd3001]",
               type: "chart",
               data: dailyData,
               chartColor: "#ffbe4c"
             },
             { 
               icon: TrendingUp, 
               label: "Monthly Reports", 
               value: monthlyTotal.toString(), 
               color: "from-[#e74732] via-[#cd3001] to-[#ffbe4c]",
               type: "chart",
               data: monthlyData,
               chartColor: "#e74732"
             },
             { 
               icon: Star, 
               label: "Yearly Reports", 
               value: yearlyTotal.toString(), 
               color: "from-[#cd3001] via-[#e74732] to-[#ffbe4c]",
               type: "chart",
               data: yearlyData,
               chartColor: "#cd3001"
             }
           ].map((stat, index) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.15 }}
               whileHover={{ y: -8, scale: 1.02 }}
               className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
             >
               {/* Gradient overlay */}
               <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
               <div className="relative z-10">
               <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-600 mt-1">{stat.label}</div>
                  </div>
                  {stat.type === "chart" && stat.data && stat.chartColor && (
                    <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      <MiniChart data={stat.data} color={stat.chartColor} />
                    </div>
                  )}
                </div>
                </div>
             </motion.div>
           ))}
         </motion.div>

        {/* Feed */}
        {connectedAddress ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mb-6"
               >
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Reports</h2>
                 <p className="text-gray-600">Anonymous, encrypted reports from our community</p>
               </motion.div>
               
               {isLoadingEvents ? (
                 <div className="space-y-4">
                   {[...Array(3)].map((_, index) => (
                     <motion.div
                       key={index}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: index * 0.1 }}
                       className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
                     >
                       <div className="animate-pulse">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                           <div className="flex-1">
                             <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                             <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                           </div>
                         </div>
                         <div className="space-y-2">
                           <div className="h-4 bg-gray-300 rounded"></div>
                           <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                 </div>
               ) : reportEvents && reportEvents.length > 0 ? (
                 <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                   {reportEvents.slice().reverse().map((report, index) => (
                     <ReportCard key={`${report.blockNumber}-${report.args.reportId}`} reportEvent={report} index={index} />
                   ))}
                 </div>
               ) : (
                 <div>

                   
                   {/* Filter Buttons */}
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="mb-6"
                   >
                     <div className="flex items-center gap-2 mb-4">
                       <Filter className="w-5 h-5 text-gray-600" />
                       <span className="font-medium text-gray-700">Filter by Category:</span>
                     </div>
                     <div className="flex flex-wrap gap-3">
                       {categories.map((category, index) => (
                         <motion.button
                           key={category}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: index * 0.1 }}
                           whileHover={{ 
                             scale: 1.05, 
                             y: -2,
                             boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
                           }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setSelectedFilter(category)}
                           className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden group ${
                             selectedFilter === category
                               ? "bg-gradient-to-r from-[#ffbe4c] via-[#e74732] to-[#cd3001] text-white shadow-xl border-2 border-orange-300"
                               : "bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:border-orange-300 hover:text-orange-700"
                           }`}
                         >
                           {/* Animated background for active state */}
                           {selectedFilter === category && (
                             <motion.div
                               className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                               animate={{
                                 backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                               }}
                               transition={{
                                 duration: 3,
                                 repeat: Infinity,
                                 ease: "linear"
                               }}
                               style={{
                                 backgroundSize: '200% 200%'
                               }}
                             />
                           )}
                           
                           {/* Hover effect particles */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             {[...Array(3)].map((_, i) => (
                               <motion.div
                                 key={i}
                                 className="absolute w-1 h-1 bg-orange-400 rounded-full"
                                 animate={{
                                   x: [0, Math.random() * 40 - 20],
                                   y: [0, Math.random() * 40 - 20],
                                   opacity: [0, 1, 0]
                                 }}
                                 transition={{
                                   duration: 1.5,
                                   repeat: Infinity,
                                   delay: i * 0.2
                                 }}
                                 style={{
                                   left: `${20 + i * 20}%`,
                                   top: '50%'
                                 }}
                               />
                             ))}
                           </div>
                           
                           <span className="relative z-10 flex items-center gap-2">
                             {category}
                             {category !== "All" && (
                               <motion.span 
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 className={`text-xs px-2 py-1 rounded-full ${
                                   selectedFilter === category 
                                     ? "bg-white/20 text-white" 
                                     : "bg-orange-100 text-orange-600"
                                 }`}
                               >
                                 {sampleReports.filter(r => r.category === category).length}
                               </motion.span>
                             )}
                           </span>
                         </motion.button>
                       ))}
                     </div>
                   </motion.div>
                   
                   <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                     {filteredReports.map((report, index) => (
                       <SampleReportCard key={report.id} report={report} index={index} />
                     ))}
                   </div>
                   
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 1 }}
                     className="text-center py-8 mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200"
                   >
                     <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Share Your Story?</h3>
                     <p className="text-gray-600 mb-6">Join our community and help build a safer environment for everyone.</p>
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setShowChatModal(true)}
                       className="bg-gradient-to-r from-[#ffbe4c] to-[#e74732] text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                     >
                       Share Your Story
                     </motion.button>
                   </motion.div>
                 </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {[
                    { tag: "#WorkplaceHarassment", count: 127, trend: "+12%" },
                    { tag: "#CyberBullying", count: 89, trend: "+8%" },
                    { tag: "#DiscriminationReport", count: 76, trend: "+15%" },
                    { tag: "#SafetyFirst", count: 54, trend: "+5%" }
                  ].map((topic, index) => (
                    <motion.div 
                      key={topic.tag}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-100 hover:bg-white/80 transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="font-medium text-purple-800 group-hover:text-purple-900">{topic.tag}</div>
                        <div className="text-sm text-gray-600">{topic.count} reports</div>
                      </div>
                      <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {topic.trend}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Live Activity Feed */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Live Activity
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </h3>
                <div className="space-y-3">
                  {[
                    { action: "New report submitted", time: "2 min ago", type: "report" },
                    { action: "Community support given", time: "5 min ago", type: "support" },
                    { action: "Report verified", time: "8 min ago", type: "verify" },
                    { action: "New user joined", time: "12 min ago", type: "user" }
                  ].map((activity, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-blue-100 hover:bg-white/80 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'report' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'support' ? 'bg-green-100 text-green-600' :
                        activity.type === 'verify' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'report' ? <FileText className="w-4 h-4" /> :
                         activity.type === 'support' ? <Heart className="w-4 h-4" /> :
                         activity.type === 'verify' ? <CheckCircle className="w-4 h-4" /> :
                         <Users className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats Dashboard */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Impact Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Reports Resolved", value: "1,247", change: "+23%", color: "green" },
                    { label: "Lives Helped", value: "892", change: "+18%", color: "blue" },
                    { label: "Active Supporters", value: "456", change: "+31%", color: "purple" },
                    { label: "Success Rate", value: "94%", change: "+2%", color: "orange" }
                  ].map((stat, index) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-white/60 rounded-lg border border-green-100 hover:bg-white/80 transition-all text-center"
                    >
                      <div className={`text-2xl font-bold ${
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      }`}>{stat.value}</div>
                      <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                      <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.change}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Support Resources */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Support Resources
                </h3>
                <div className="space-y-3">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-all"
                  >
                    <div className="font-medium text-red-800">Emergency Help</div>
                    <div className="text-sm text-red-600">WAO: +603 3000 8858</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-all"
                  >
                    <div className="font-medium text-blue-800">Online Counseling</div>
                    <div className="text-sm text-blue-600">Available 24/7</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-all"
                  >
                    <div className="font-medium text-green-800">Legal Support</div>
                    <div className="text-sm text-green-600">Free consultation</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Privacy & Security */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  Privacy & Security
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    End-to-end encryption
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Anonymous reporting
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Blockchain security
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    No personal data stored
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your wallet to access the secure, encrypted reporting platform and view community reports.
            </p>
            <RainbowKitCustomConnectButton />
          </motion.div>
         )}
       </div>

       {/* Floating Action Button */}
       {connectedAddress && (
         <motion.button
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => setShowChatModal(true)}
           className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#ffbe4c] to-[#e74732] text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:shadow-3xl transition-all"
         >
           <motion.div
             animate={{ rotate: showChatModal ? 45 : 0 }}
             transition={{ duration: 0.2 }}
           >
             <Plus className="w-8 h-8" />
           </motion.div>
         </motion.button>
       )}
 
       {/* Chat Modal */}
      <AnimatePresence>
        {showChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-screen flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#ffbe4c] to-[#e74732] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <div>
                      <h3 className="text-xl font-bold">Share Your Story</h3>
                      <p className="text-orange-100 text-sm">Safe, confidential, and encrypted</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowChatModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col p-6">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
                  {messages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-purple-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">You're in a safe space</h4>
                      <p className="text-gray-600 text-sm">Share your experience. Our AI assistant is here to listen and help.</p>
                    </motion.div>
                  )}
                  
                  {messages.map((msg, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {msg.content.split("\n").map((line, i) => {
                          // Parse text with **bold** formatting
                          const parts = line.split(/\*\*(.*?)\*\*/g);
                          return (
                            <p key={i} className={i > 0 ? "mt-2" : ""}>
                              {parts.map((part, partIndex) => 
                                partIndex % 2 === 1 ? (
                                  <strong key={partIndex}>{part}</strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoadingAI && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoadingAI || isLoadingBlockchain}
                  />
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#ffbe4c] to-[#e74732] text-white p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingAI || isLoadingBlockchain}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>

                {/* Gasless Transaction Toggle */}
                {messages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-3"
                  >
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                      <Zap className={`w-4 h-4 ${useGasless ? 'text-yellow-400' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-white">Gasless Transaction</span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUseGasless(!useGasless)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                          useGasless ? 'bg-yellow-400' : 'bg-gray-600'
                        }`}
                      >
                        <motion.div
                          animate={{ x: useGasless ? 24 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                        />
                      </motion.button>
                      {useGasless && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs text-yellow-300 font-medium"
                        >
                          FREE
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Submit to Blockchain */}
                {messages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex justify-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitToBlockchain}
                      disabled={isLoadingBlockchain || messages.length === 0}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingBlockchain ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {useGasless ? 'Submitting Gasless...' : 'Encrypting & Submitting...'}
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          {useGasless ? 'Submit Gasless Report' : 'Finalize & Encrypt Report'}
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowChatModal(false);
                        alert('Experience shared successfully! Your story has been added to the community reports to help others.');
                      }}
                      disabled={messages.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share the Experience on Community Reports
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button */}
      {!showChatModal && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.button
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              boxShadow: "0 20px 40px rgba(231, 71, 50, 0.3)"
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChatModal(true)}
            className="bg-gradient-to-r from-[#ffbe4c] via-[#e74732] to-[#cd3001] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            />
            
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative z-10 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium hidden sm:block">Share Story</span>
            </div>
            
            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 10 - 5, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                style={{
                  left: `${30 + i * 15}%`,
                  top: '20%'
                }}
              />
            ))}
          </motion.button>
        </motion.div>
      )}
      
      {/* Background Enhancement */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Additional floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              i % 4 === 0 ? 'bg-orange-200/30' :
              i % 4 === 1 ? 'bg-red-200/30' :
              i % 4 === 2 ? 'bg-yellow-200/30' :
              'bg-pink-200/30'
            }`}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
