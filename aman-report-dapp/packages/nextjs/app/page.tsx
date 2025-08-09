"use client";

import { useState, useRef, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton, Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { getWrappedEthersSigner } from "~~/utils/web3";
import { Contract } from "ethers";
import deployedContracts from "~~/contracts/deployedContracts";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Lock, Shield, Heart, AlertTriangle, X, Send, Plus, Users, Calendar, Eye, Share2, Bookmark, MoreHorizontal, Zap, Star, TrendingUp, Filter } from "lucide-react";

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
      
      // Use ethers with Sapphire wrapper for guaranteed encryption
      const signer = await getWrappedEthersSigner();
      const account = await signer.getAddress();
      
      if (contractInfo.address.toLowerCase() === account.toLowerCase()) {
        throw new Error('Contract address equals your wallet address – check deployment');
      }
      
      const contract = new Contract(contractInfo.address, contractInfo.abi, signer);
      
      // Submit the encrypted report
      const txResp = await contract.submitReport(JSON.stringify(messages));
      const txHash = txResp.hash;
      
      alert(`Report successfully and securely submitted to the blockchain!\nTransaction Hash: ${txHash}\n\nYour transaction is now viewable on the Sapphire Testnet Explorer.\nClick OK to view transaction details.`);
      
      // Open block explorer to show transaction details
      window.open(`https://explorer.oasis.io/testnet/sapphire/tx/${txHash}`, '_blank');
      
      setMessages([]);
    } catch (error) {
      console.error("Error submitting to blockchain:", error);
      alert("Failed to submit report. Please ensure your wallet is connected to Sapphire Testnet and you have enough funds for gas.");
    } finally {
      setIsLoadingBlockchain(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Aman Report
                </h1>
                <p className="text-sm text-gray-500">Safe • Confidential • Encrypted</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChatModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
           className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
         >
           {[
             { 
               icon: Shield, 
               label: "Reports Secured", 
               value: totalReportCount ? totalReportCount.toString() : "0", 
               color: "from-blue-500 to-cyan-500" 
             },
             { 
               icon: Users, 
               label: "Community Reports", 
               value: reportEvents ? reportEvents.length.toString() : "0", 
               color: "from-green-500 to-emerald-500" 
             },
             { 
               icon: TrendingUp, 
               label: "Blockchain Security", 
               value: "100%", 
               color: "from-purple-500 to-pink-500" 
             },
             { 
               icon: Star, 
               label: "Encryption Level", 
               value: "AES-256", 
               color: "from-orange-500 to-red-500" 
             }
           ].map((stat, index) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               whileHover={{ y: -2 }}
               className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
             >
               <div className="flex items-center gap-3">
                 <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                   <stat.icon className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                   <div className="text-sm text-gray-500">{stat.label}</div>
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
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-center py-8 mb-8"
                   >
                     <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <MessageCircle className="w-8 h-8 text-purple-500" />
                     </div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">Sample Community Reports</h3>
                     <p className="text-gray-600 text-sm">Here are some examples of how our community shares their experiences safely and anonymously.</p>
                   </motion.div>
                   
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
                     <div className="flex flex-wrap gap-2">
                       {categories.map((category) => (
                         <motion.button
                           key={category}
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setSelectedFilter(category)}
                           className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                             selectedFilter === category
                               ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                               : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                           }`}
                         >
                           {category}
                           {category !== "All" && (
                             <span className="ml-1 text-xs opacity-75">
                               ({sampleReports.filter(r => r.category === category).length})
                             </span>
                           )}
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
                     className="text-center py-8 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
                   >
                     <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Share Your Story?</h3>
                     <p className="text-gray-600 mb-6">Join our community and help build a safer environment for everyone.</p>
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setShowChatModal(true)}
                       className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                     >
                       Share Your Story
                     </motion.button>
                   </motion.div>
                 </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Support Resources */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Support Resources
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="font-medium text-red-800">Emergency Help</div>
                    <div className="text-sm text-red-600">WAO: +603 3000 8858</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-800">Online Counseling</div>
                    <div className="text-sm text-blue-600">Available 24/7</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-800">Legal Support</div>
                    <div className="text-sm text-green-600">Free consultation</div>
                  </div>
                </div>
              </motion.div>

              {/* Community Guidelines */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  Privacy & Security
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    End-to-end encryption
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Anonymous reporting
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Blockchain security
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    No personal data stored
                  </div>
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
           className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:shadow-3xl transition-all"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <div>
                      <h3 className="text-xl font-bold">Share Your Story</h3>
                      <p className="text-purple-100 text-sm">Safe, confidential, and encrypted</p>
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
                        {msg.content.split("\n").map((line, i) => (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                        ))}
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
                    className="flex-1 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoadingAI || isLoadingBlockchain}
                  />
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingAI || isLoadingBlockchain}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>

                {/* Submit to Blockchain */}
                {messages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitToBlockchain}
                      disabled={isLoadingBlockchain || messages.length === 0}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {isLoadingBlockchain ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Encrypting & Submitting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Finalize & Encrypt Report
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
