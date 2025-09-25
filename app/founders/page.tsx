"use client";

import { Footer } from "@/components/footer";
import { EnhancedNavigation } from "@/components/enhanced-navigation";
import { ScrollProgress } from "@/components/scroll-progress";
import { BackToTop } from "@/components/back-to-top";
import {
  Linkedin,
  Mail,
  Users,
  Truck,
  Camera,
  DollarSign,
  X,
  Workflow,
  Briefcase,
  Cpu,
  Instagram,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const founders = [
  {
    name: "Tala Swaidan",
    role: "Secretary-General",
    department: "Core",
    image: "/founders/TalaSwaidan_SG.png",
    bio: "Leading VOFMUN with a vision for inclusive global dialogue and youth empowerment in international relations.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "",
    instagram: "https://www.instagram.com/vofmun",
    achievements: [
      "Founded VOFMUN",
      "Youth Diplomat Award",
      "Global Leadership Certificate",
    ],
    quote: "Diplomacy is the art of letting someone else have your way.",
    writeup:
      "My name is Tala Swaidan. I am a year 10 student at GEMS Metropole School, Motor city, and I have the great honor and privilege of serving as the Founder and Secretary-General of Voices of the Future Model United Nations (VOFMUN). VOFMUN all began as a lighthearted and funny idea shared among friends, but with time, dedication, and great effort, it grew into something far more meaningful; a platform for courageous MUN diplomats to engage in diplomacy, express their perspectives, and take on global issues with confidence and purpose. Beyond my work with VOFMUN, I am an active member of my school's Student Council and have been deeply involved in Model United Nations for several years. I also pursue my passions in sports, particularly basketball and kickboxing with MVP recognitions, which have both taught me the value of discipline, teamwork, and perseverance. I hope to expand my horizons during the next academic year, along with working on the development of the first VOFMUN conference, taking place in the January of 2026. Through all my endeavors, I strive to foster positive change, empower others, and lead with integrity. As VOFMUN continues to grow, my hope is that it remains a space where young leaders can find their voice, challenge their thinking, and leave inspired to shape a better world. I'm incredibly proud of how far we've come — and even more excited for what's ahead. See you soon!",
  },
  {
    name: "Clyde Jared Robis",
    role: "Deputy Secretary-General",
    department: "Core",
    image: "/founders/ClydeJaredRobis_DSG.png",
    bio: "Supporting the Secretary-General in strategic planning and ensuring operational excellence across all departments.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "clydejared@gmail.com",
    instagram: "https://www.instagram.com/maybe_jareddd",
    achievements: [
      "Strategic Planning Expert",
      "Operations Excellence",
      "Team Leadership",
    ],
    quote:
      "Excellence is never an accident; it is always the result of high intention.",
    writeup:
      "Hello delegates, chairs and dear readers. My name is Jared Robis (the existence of first name 'Clyde' is false), and I am the Deputy Secretary-General of 'Voices of the Future' MUN coming this 2026. I've attended various MUNs such as GFSMUN V and QuixMUN, and I'm definitely planning to attend more conferences in the later years. I'm currently going into Year 11 at GEMS Metropole School, and through this I've honed my skills in fields such as management and leadership, teamwork and communication amongst team members. This ties into what I do in VOFMUN, as Deputy Secretary-General I oversee all the processes that occur within the backstage of our MUN along with assisting in any work that is requested. I hope to meet you all in VOFMUN 2026, stay tuned.",
  },
];

const departmentHeads = [
  {
    name: "Vihaan Shukla",
    role: "<strong>Head of Committees</strong>",
    department: "Committees",
    image: "/founders/VihaanShukla_Committees.png",
    bio: "Managing committee structure, topics, and ensuring engaging debates that address pressing global challenges.",
    linkedin: "https://www.linkedin.com/in/vihaanshukla",
    email: "vihaanshukla22@gmail.com",
    instagram: "https://www.instagram.com/vofmun",
    achievements: [
      "Committee Innovation",
      "Debate Excellence",
      "Topic Research",
    ],
    quote: "Great debates shape the future of diplomacy.",
    writeup:
      "Hi, I'm Vihaan Shukla, Head of Committees for VOFMUN 2026! I've participated in 13 MUNs, earning awards such as Best Delegate and Best Research, and have chaired multiple times too, developing strong debate and communication skills. I'm a Year 11 student at Dubai International Academy Emirates Hills, rengthening my leadership, event and am a part of the DIAMUN 2026 Events Team, playing a key role in organising one of the largest conferences in the MENA region. Previously, I've served as Student Council President and on the DIA Debate Society Events Team, storganisation, and team management skills. I'm also Founder of YouthPropel, a youth-led initiative expanding access to high-impact academic opportunities. At VOFMUN, I'm in charge of curating committees, topics, and crises while working to enhance your experience! My goal for VOFMUN is to design dynamic, career-focused committees that are engaging to debate in and also relevant to real-world industries. See you there!",
  },
  {
    name: "Ansh Gupta",
    role: "<strong>Head of Technology</strong>",
    department: "Technology",
    image: "/founders/AnshGupta_Tech.png",
    bio: "Overseeing all technological infrastructure and digital platforms to enhance the conference experience.",
    linkedin: "https://www.linkedin.com/in/anshvg",
    email: "dxb.avg@gmail.com",
    instagram: "https://www.instagram.com/vofmun",
    achievements: [
      "Digital Innovation",
      "Platform Development",
      "Tech Leadership",
    ],
    quote: "Technology bridges the gap between ideas and reality.",
    writeup:
      "Hi, I'm Ansh Gupta, Head of Technology for VOFMUN 2026 and a Year 11 student at Dubai International Academy Emirates Hills. I built this conference website and the conference webapp. I manage all the technical aspects of the conference which include this site and the webapp to ensure smooth operations. I also serve as Deputy Head of Technology for DIAMUN and Head of Technology for EconMinds xChange, where I build and maintain event websites and tools. Highlights include 1st place at DIA Game Jam 2025 after rebuilding our game in React in the final week, Best Product and 1st Place at DIATECH 2025, projects at InnovAIte Hackathon, and a Python data tool for ASCC 2025. I co lead SyntaxEngine and stay active in math and debate with DIAMathletes 1st place, World Scholars Cup awards, and an EISJMUN verbal mention. See more on my website:",
    websiteLink: "https://anshgupta.site",
  },
  {
    name: "Aryan Shah",
    role: "<strong>Head of Delegate Affairs</strong>",
    department: "Delegate Affairs",
    image: "/founders/AryanShah_DelegateAffairs.png",
    bio: "Ensuring exceptional delegate experience through comprehensive support and engagement initiatives.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "aryan.p.shah@gmail.com",
    instagram: "https://www.instagram.com/swollen_arch",
    achievements: [
      "Delegate Satisfaction",
      "Experience Design",
      "Community Building",
    ],
    quote: "Every delegate's journey matters in shaping global perspectives.",
    writeup:
      "Hi I'm Aryan Shah, Head of Delegate Affairs for VOFMUN 2026! I have previously participated 4 MUN conferences, and have recieved an honerable mention in one of them. I am currently a year 11/ MYP 5 student at Dubai International Academy. I am also Vice president of my school's Cubing and AI Club. Outside of School I have organised and histen multiple interntaionally recognized Rubik Cube Comeptitions that haave attarcted the attention of some of the bets cubers in the MENA reigon. At VOFMUM my goal is to ensure that all the deleagtes have an amazing expeirence at VOFMUN by handeling all delegate-related matters that range from registration to country allocation and communication and support to all delegates.",
  },
  {
    name: "Elinore Sweiss",
    role: "<strong>Co-Head of Logistics</strong>",
    department: "Logistics",
    image: "/founders/ElinoreSweiss_Logistics.png",
    bio: "Coordinating all logistical operations to ensure seamless conference execution and delegate comfort.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "",
    instagram: "https://www.instagram.com/elinore_sweiss",
    achievements: [
      "Operations Excellence",
      "Event Coordination",
      "Process Optimization",
    ],
    quote: "Perfect execution starts with meticulous planning.",
    writeup:
      "Hi, I’m Elinore Sweiss, Co-Head of Logistics for VOFMUN 2026! I’ve participated in several MUNs, gaining awards such as Best Research, which have helped me build confidence in public speaking, leadership, and diplomacy. Beyond MUN, I’ve excelled in academics, music, sports, and art, achieving a Distinction in ABRSM Grade 5 Piano and am currently working on Piano Grade 6. I also train in rhythmic gymnastics, winning 2nd overall and 3rd overall at separate competitions, and a Grade 8 at my End of Year art exam. These experiences have sharpened my discipline, problem-solving, and organizational skills. At VOFMUN 2026, I am excited to use these strengths as Co-Head of Logistics, ensuring everything runs seamlessly.",
  },
  {
    name: "Muhammad Talha Sohail",
    role: "<strong>Co-Head of Logistics</strong>",
    department: "Logistics",
    image: "/founders/MuhammadTalhaSohail_Logistics.png",
    bio: "Co-leading logistical coordination and venue management for optimal conference operations.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "conectmts@gmail.com",
    instagram: "https://www.instagram.com/vofmun",
    achievements: ["Venue Management", "Coordination", "Operations"],
    quote: "Seamless logistics create memorable experiences.",
    writeup:
      "Hi I'm Muhammad Talha, deputy head of committees for VOFMUN 2026! I have previously participated 8 MUN conferences, and received one best delegate and one best research. I am currently a year 11 student at metropole. I am also part of global innovation and maker and coders at my school while out of school I am a part of Waterloo Computer Science tournament and Dubai sci fair. At VOFMUM my goal is to ensure all committees are well established and functional to the MUN.",
  },
  {
    name: "Ammiel Lupian",
    role: "<strong>Head of Media</strong>",
    department: "Media",
    image: "/founders/AmmielLupian_Media.png",
    bio: "Creating engaging content and managing social media presence to connect with the global MUN community.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "",
    instagram: "https://www.instagram.com/vofmun",
    achievements: ["Content Creation", "Social Media", "Community Engagement"],
    quote: "Authentic stories connect hearts across borders.",
    writeup:
      "Hey it's Ammiel Lupian, Head of Media & Marketing for VOFMUN 2026. I'm a Year 11 student at the amazing GEMS Metropole. If you're looking for information regarding sociology I am the right person to look for. My goal in VOFMUN is to shape a compelling image through the creativity and data-driven minds of me and my team to engage delegates to participate in our conferences.",
  },
  {
    name: "Tamara Moshawrab",
    role: "<strong>Head of Finance</strong>",
    department: "Finance",
    image: "/founders/TamaraMoshawrab_Finance.png",
    bio: "Managing financial operations and ensuring sustainable growth for VOFMUN's future initiatives.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "",
    instagram: "https://www.instagram.com/vofmun",
    achievements: [
      "Financial Planning",
      "Budget Management",
      "Growth Strategy",
    ],
    quote: "Financial wisdom enables diplomatic dreams.",
    writeup:
      "Hello! My name is Tamara Moshawrab, and I'm currently a Year 11 student at SABIS International school of Choueifat Dubai. I'm honored to be apart of the secretariat of Voices of the Future Model UN, serving as the Head of Finance! Taking on this role has allowed me to combine two things I genuinely enjoy: being part of an ambitious team and applying practical financial thinking to real-world scenarios. Academically, I've chosen to study IGCSE Business and AP Economics because I'm deeply interested in understanding how global markets operate and how economic policy can shape the world we live in. These subjects also support my long-term goal of becoming a lawyer, as I believe a strong foundation in business and economics will help me approach legal challenges with a more well-rounded perspective. Outside of class, I'm passionate about debate and MUN—there's something about public speaking, critical thinking, and global problem-solving that pushes me to grow every time I participate. I'm also a tennis player, which keeps me grounded and helps me stay focused and disciplined. Being part of the journey of VOFMUN has already been such a wonderful and positive experience, and I'm excited to help manage our resources to ensure this year's conference is not just successful and memorable, but unforgettable. We hope to see you there!",
  },
];

const deputyHeads = [
  {
    name: "Gabrielle Zietsman",
    role: "<strong>Deputy Head of Committees</strong>",
    department: "Committees",
    image: "/founders/GabrielleZietsman_Committees.png",
    bio: "Supporting committee operations and fostering innovative approaches to Model UN debate formats.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "Gabrielle.zietsman@icloud.com",
    instagram: "https://www.instagram.com/ather.is.alive/",
    achievements: ["Committee Support", "Innovation", "Debate Formats"],
    quote: "Innovation in debate creates lasting diplomatic impact.",
    writeup:
      "My name is Gabrielle Zietsman, but you can call me Gaby, and I am the Deputy Head of Logistics for 'Voices of the Future' MUN coming this 2026. I'm currently going into Year 11 at GEMS Metropole School, and have held numerous leadership poisiotns in school, such as a Wellbeing Leader and House Captain. If you go to my school, you might have also heard me on the radio on Fridays. These past experiences all help me with what I do in VOFMUN, as the Deputy Head of Logistics, who supports the Head of Logistics by overseeing daily supply chain operations, managing the team, and ensuring the efficient flow. I hope to see you all in VOFMUN 2026, have a good day!!",
  },
  {
    name: "Reem Ghanayem",
    role: "<strong>Deputy Head of Logistics</strong>",
    department: "Logistics",
    image: "/founders/ReemGhanayem_Logistics.png",
    bio: "Supporting logistics team in registration processes and delegate services coordination.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "reemomarghanayem511@gmail.com",
    instagram: "https://www.instagram.com/r33m.0g",
    achievements: [
      "Registration Systems",
      "Delegate Services",
      "Process Design",
    ],
    quote: "Every detail matters in creating excellence.",
    writeup:
      "Hello I'm Reem Ghanayem Deputy Head of Logistics for VOFMUN 2026! I have previously participated emarites literary festival, I have participated in dance exams, play a bit of piano , worked in marketing and enjoy public speaking, and I speak arabic and English . I am currently a year 11 student at Gems Metropole School, motor city. I am also part of the theater program at my school. At VOFMUM my goal is to ensure the MUN goes smoothly and to essentially help plan the logistics aspects of the MUN behind the scenes including, venue , crisis ideas and more . I will try my best to make this MUN fun and informational for anyone who would like to join!",
  },
  {
    name: "Farah Yu",
    role: "<strong>Deputy Head of Media</strong>",
    department: "Media",
    image: "/founders/FarahYu.png",
    bio: "Supporting media operations and developing creative campaigns to promote youth engagement.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "farahyu1598@gmail.com",
    instagram: "https://www.instagram.com/vofmun",
    achievements: [
      "Content Creation",
      "Creative Campaigns",
      "Community Engagement",
    ],
    quote: "Authentic stories connect hearts across borders.",
    writeup:
      "Hi, my name is Hanxiao Yu, but you can also call me Farah.I can speak 3 languages, arabic, english and mandarin,and so if anyone is struggling with languages you can come find me.I'm the Deputy Head of Media and Marketing for VOFMUN 2026. I've taken part in the World Scholar's Cup before, so I already have some experience with debating. I'm also a Year 11 student at GEMS Metropole, Motor City. At VOFMUN, my goal is to promote and represent the conference, while inspiring others and making sure our media and marketing highlight the vision of the event.",
  },
  {
    name: "Noya Fareed",
    role: "<strong>Deputy Head of Media</strong>",
    department: "Media",
    image: "/founders/NoyaFareed_Media.png",
    bio: "Developing creative campaigns and partnerships to promote youth engagement in international affairs.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "noyafareed@gmail.com",
    instagram: "https://www.instagram.com/noya.fareed",
    achievements: ["Creative Campaigns", "Partnerships", "Youth Engagement"],
    quote: "Creativity amplifies the voice of youth diplomacy.",
    writeup:
      "Hi my name is Noya Fareed, deputy head of media and marketing for VOFMUN 2026! I have previously participated 2 MUN conferences, receiving best first delegate in my first conference ever! I am currently a year 11 student at Gems Metropole Motor City. I take part in musical theatre and play drums, and cook/ bake, play cricket, dance and am part of girl up social media team ! my goal is to make people as enthusiastic for this mun to happen, just like we are!",
  },
  {
    name: "Noaf Qassem",
    role: "<strong>Deputy Head of Finance</strong>",
    department: "Finance",
    image: "/founders/NoafQassem_Finance.png",
    bio: "Supporting financial planning and budget management to ensure conference sustainability and growth.",
    linkedin: "https://www.linkedin.com/company/vofmun",
    email: "noafbintamerqassem@gmail.com",
    instagram: "https://www.instagram.com/vofmun",
    achievements: ["Financial Analysis", "Budget Planning", "Sustainability"],
    quote: "Smart financial decisions build lasting legacies.",
    writeup:
      "I'm Noaf Qassem, a Year 11 student at SABIS International School of Choueifat Dubai, and I'm incredibly proud to be serving as the Deputy Head of Finance of Voices of the Future 2026! Being part of the VOFMUN leadership has given me the opportunity to contribute to something meaningful while building valuable skills in organization, teamwork, and strategic planning. I've chosen to take IGCSE Business, AP Economics, and AP Statistics—subjects that reflect my deep interest in global systems, economic theory, and data-driven decision-making. My future aspirations lie in either diplomacy or economics, and I believe that understanding the mechanics of both global policy and financial systems will prepare me to make a real impact in those fields. MUN has always been a space where I've been able to grow—not just as a speaker and thinker, but as a global citizen. I love the way it challenges me to think critically, communicate clearly, and collaborate with others to solve complex issues. Outside of academics, I am an ongoing track and field athelete, which helps shape my perspective on core life skills such as discipline, leadership, and respect. Being part of the VOFMUN team and this great journey has been incredibly exciting, and I'm committed to ensuring the financial planning behind the scenes helps make this conference as smooth, impactful, and unforgettable as possible. Can't wait to see what we accomplish together—hope to see you a VOFMUN 2026!",
  },
];

const getDepartmentIcon = (department: string) => {
  switch (department) {
    case "Core":
      return Briefcase;
    case "Committees":
      return Users;
    case "Technology":
      return Cpu;
    case "Delegate Affairs":
      return Workflow;
    case "Logistics":
      return Truck;
    case "Media":
      return Camera;
    case "Finance":
      return DollarSign;
    default:
      return Users;
  }
};

const getDepartmentColor = (department: string) => {
  switch (department) {
    case "Core":
      return {
        bg: "bg-gradient-to-br from-[#B22222] to-[#8B0000]",
        text: "text-white",
        border: "border-[#B22222]",
        badgeClass: "bg-[#B22222] text-white border-0",
      };
    case "Committees":
      return {
        bg: "bg-gradient-to-br from-blue-500 to-blue-700",
        text: "text-white",
        border: "border-blue-500",
        badgeClass: "bg-blue-600 text-white border-0",
      };
    case "Technology":
      return {
        bg: "bg-gradient-to-br from-green-500 to-green-700",
        text: "text-white",
        border: "border-green-500",
        badgeClass: "bg-green-600 text-white border-0",
      };
    case "Delegate Affairs":
      return {
        bg: "bg-gradient-to-br from-purple-500 to-purple-700",
        text: "text-white",
        border: "border-purple-500",
        badgeClass: "bg-purple-600 text-white border-0",
      };
    case "Logistics":
      return {
        bg: "bg-gradient-to-br from-orange-500 to-orange-700",
        text: "text-white",
        border: "border-orange-500",
        badgeClass: "bg-orange-600 text-white border-0",
      };
    case "Media":
      return {
        bg: "bg-gradient-to-br from-pink-500 to-pink-700",
        text: "text-white",
        border: "border-pink-500",
        badgeClass: "bg-pink-600 text-white border-0",
      };
    case "Finance":
      return {
        bg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
        text: "text-white",
        border: "border-emerald-500",
        badgeClass: "bg-emerald-600 text-white border-0",
      };
    default:
      return {
        bg: "bg-gradient-to-br from-gray-500 to-gray-700",
        text: "text-white",
        border: "border-gray-500",
        badgeClass: "bg-gray-600 text-white border-0",
      };
  }
};

export default function FoundersPage() {
  const [selectedFounder, setSelectedFounder] = useState<number | null>(null);
  const [hoveredFounder, setHoveredFounder] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFounder, setModalFounder] = useState<(typeof founders)[0] | null>(
    null,
  );

  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setModalFounder(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const openModal = (founder: any) => {
    setModalFounder(founder);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalFounder(null);
  };

  const renderFounderCard = (
    founder: any,
    index: number,
    isDeputy: boolean = false,
  ) => {
    const IconComponent = getDepartmentIcon(founder.department);
    const colors = getDepartmentColor(founder.department);
    const isHovered = hoveredFounder === index;

    return (
      <div
        key={index}
        className={`relative group cursor-pointer transition-all duration-700 ${
          isHovered ? "transform scale-105 z-10" : ""
        }`}
        onClick={() => openModal(founder)}
        onMouseEnter={() => setHoveredFounder(index)}
        onMouseLeave={() => setHoveredFounder(null)}
      >
        <div
          className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${colors.border}/30 relative overflow-hidden ${
            isHovered ? "shadow-2xl animate-glow" : ""
          } ${isDeputy ? "p-4 scale-90" : "p-6"}`}
        >
          {/* Animated background */}
          <div
            className={`absolute inset-0 ${colors.bg} opacity-5 transition-opacity duration-300 ${
              isHovered ? "opacity-10" : ""
            }`}
          ></div>

          <div className="relative z-10">
            {/* Department Badge */}
            <div className="flex justify-center mb-6">
              <div className={`p-3 ${colors.bg} rounded-full shadow-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <div
                className={`relative w-28 h-28 rounded-full border-4 ${colors.border} shadow-lg overflow-hidden`}
              >
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name and Role */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">
                {founder.name}
              </h3>
              <p
                className="text-gray-600 text-sm mb-4"
                dangerouslySetInnerHTML={{ __html: founder.role }}
              />

              {/* Department Badge */}
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${colors.badgeClass}`}
              >
                {founder.department}
              </span>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-4">
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#0077B5] rounded-full flex items-center justify-center hover:bg-[#005885] transition-all duration-300 hover:scale-110 shadow-md"
                  aria-label={`${founder.name} LinkedIn`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              )}
              {founder.email && (
                <a
                  href={`mailto:${founder.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-md"
                  aria-label={`Email ${founder.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              )}
              {founder.instagram && (
                <a
                  href={founder.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dd2a7b] rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-[#e6683c] hover:via-[#dd2a7b] hover:to-[#8134af] transition-all duration-300 hover:scale-110 shadow-md"
                  aria-label={`${founder.name} Instagram`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#ffecdd]">
      <EnhancedNavigation />
      <ScrollProgress />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-[#ffecdd]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[#B22222] mb-6 font-serif">
              Meet Our Founding Team
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
              Meet the dedicated founding team behind VOFMUN – young leaders
              committed to fostering global dialogue and diplomatic excellence.
            </p>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#B22222] text-center mb-12 font-serif">
              Leadership Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...founders, ...departmentHeads].map((founder, index) =>
                renderFounderCard(founder, index),
              )}
            </div>
          </div>
        </section>

        {/* Deputy Heads */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-600 text-center mb-3 font-serif">
              Deputy Leadership
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Supporting our department heads with dedicated expertise and
              collaborative leadership
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {deputyHeads.map((founder, index) =>
                renderFounderCard(
                  founder,
                  index + founders.length + departmentHeads.length,
                  true,
                ),
              )}
            </div>
          </div>
        </section>

        {/* Modal */}
        {isModalOpen && modalFounder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
              {/* Left - Image & Department */}
              <div
                className={`md:w-1/3 ${getDepartmentColor(modalFounder.department).bg} flex flex-col items-center justify-center p-6`}
              >
                <div className="relative w-48 h-60 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={modalFounder.image}
                    alt={modalFounder.name}
                    width={180}
                    height={220}
                    className="object-cover rounded-xl"
                  />
                </div>
                <h2 className="text-white text-2xl font-bold mt-4">
                  {modalFounder.name}
                </h2>
                <p
                  className="text-white opacity-90"
                  dangerouslySetInnerHTML={{ __html: modalFounder.role }}
                />
                <span className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mt-2 text-sm text-white">
                  {modalFounder.department}
                </span>
              </div>

              {/* Right - Content */}
              <div className="md:w-2/3 p-6 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed">
                  {modalFounder.writeup}
                  {modalFounder.websiteLink && (
                    <a
                      href={modalFounder.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline ml-1"
                    >
                      anshgupta.site
                    </a>
                  )}
                </p>
                {(modalFounder.linkedin ||
                  modalFounder.email ||
                  modalFounder.instagram) && (
                  <div className="flex space-x-4 pt-6 border-t mt-6">
                    {modalFounder.linkedin && modalFounder.linkedin.trim() && (
                      <a
                        href={modalFounder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition hover:scale-105"
                      >
                        <Linkedin className="w-5 h-5" /> <span>LinkedIn</span>
                      </a>
                    )}
                    {modalFounder.email && modalFounder.email.trim() && (
                      <a
                        href={`mailto:${modalFounder.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg transition hover:scale-105"
                      >
                        <Mail className="w-5 h-5" /> <span>Email</span>
                      </a>
                    )}
                    {modalFounder.instagram &&
                      modalFounder.instagram.trim() && (
                        <a
                          href={modalFounder.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg transition hover:scale-105"
                        >
                          <Instagram className="w-5 h-5" />{" "}
                          <span>Instagram</span>
                        </a>
                      )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg transition hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(178, 34, 34, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(178, 34, 34, 0.6);
          }
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(1deg);
          }
          75% {
            transform: rotate(-1deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}