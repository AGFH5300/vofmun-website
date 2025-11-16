"use client";

import { Footer } from "@/components/footer";
import { EnhancedNavigation } from "@/components/enhanced-navigation";
import { ScrollProgress } from "@/components/scroll-progress";
import { BackToTop } from "@/components/back-to-top";
import {
  Linkedin,
  Users,
  Truck,
  Camera,
  DollarSign,
  X,
  Workflow,
  Briefcase,
  Cpu,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

type SecretariatMember = {
  name: string;
  role: string;
  department: string;
  image: string;
  bio: string;
  writeup: string;
  linkedin?: string;
  websiteLink?: string;
};

const DEFAULT_LINKEDIN = "https://www.linkedin.com/company/vofmun";

const foundingSecretariat: SecretariatMember[] = [
  {
    name: "Tala Swaidan",
    role: "<strong>Founder &<br/>Secretary-General</strong>",
    department: "Core",
    image: "/founders/TalaSwaidan_SG.jpg",
    bio: "Co-founder guiding VOFMUN's vision for inclusive and empowering youth diplomacy.",
    linkedin: "https://www.linkedin.com/in/tala-swaidan-401547216",
    writeup: `Hello! My name is Tala Swaidan, and I have the great honor and privilege of serving as the Founder and Secretary-General of Voices of the Future Model United Nations (VOFMUN) alongside my fantastic founding secretariat team. 

VOFMUN all began as an abstract idea shared among friends. But with time, dedication, and great effort, it grew into something far more meaningful: a platform for courageous MUN delegates to engage in diplomacy, express their perspectives, and take on global issues with confidence and purpose.

Beyond my work with VOFMUN, I am an active member of my school's Digital Innovation and Technology team, have been deeply involved in Model United Nations for several years and have participated in over 15 Model United Nations conferences, with an extensive range of various awards. Moreover, I am the founder of my school’s STEM Society, where I lead workshops and projects to inspire students to explore science and innovation beyond the classroom. I also pursue my passions in sports, particularly basketball and kickboxing with MVP recognitions, which have both taught me the value of discipline, teamwork, and perseverance. Furthermore, I am deeply passionate about medicine and aspire to pursue it in the future.

I hope to expand my horizons during the next academic year, working on initiatives such as GenAid, a youth-led nonprofit initiative dedicated to promoting dignity, hygiene, and health access in underserved communities, and on the first VOFMUN conference, taking place in February 2026. Through all my endeavors, I strive to foster positive change, empower others, and lead with integrity.

As VOFMUN continues to grow, my hope is that it remains a space where young leaders can find their voice, challenge their thinking, and leave inspired to shape a better world. VOFMUN strives to empower young people, cultivate leadership, and amplify every voice; the Voices of the Future. I'm incredibly proud of how far we've come - and even more excited for what's ahead. See you soon at VOFMUN 2026!`,
  },
  {
    name: "Vihaan Shukla",
    role: "<strong>Co-Founder &<br/>Head of Conference Affairs & Operations</strong>",
    department: "Conference Affairs",
    image: "/founders/VihaanShukla_ConferenceAffairs.png",
    bio: "Co-founder overseeing conference operations, logistics, and delegate experience design.",
    linkedin: "https://www.linkedin.com/in/vihaanshukla",
    writeup: `Hi, I’m Vihaan Shukla, Co-Founder and Head of Conference Affairs & Operations at VOFMUN 2026!

I have participated in over 15 MUN conferences, earning more than 10 awards including Best Delegate and Best Research. I’ve also chaired 5 conferences, developing strong skills in debate, diplomacy, and communication.

I am currently a Year 11 student at Dubai International Academy, Emirates Hills, and a member of the DIAMUN 2026 Events Team, contributing to the organisation of one of the largest MUN conferences in the MENA region.

Beyond VOFMUN, I am the Founder of YouthPropel, a youth-led initiative dedicated to expanding access to high-impact academic and leadership opportunities for students across schools and regions. Through YouthPropel, I lead seminars, partnerships, and outreach projects that aim to make platforms like MUN, debate, and public speaking more inclusive and accessible to under-represented communities.

At VOFMUN, I oversee conference operations, logistics, and committee affairs, ensuring a seamless and engaging delegate experience. My goal is to design a dynamic, career-focused conference that bridges global relevance with meaningful academic enrichment for all participants.`,
  },
];

const leadershipTeam: SecretariatMember[] = [
  {
    name: "Ansh Gupta",
    role: "<strong>Head of Technology</strong>",
    department: "Technology",
    image: "/founders/AnshGupta_Tech.png",
    bio: "Building and maintaining the digital platforms that power every VOFMUN experience.",
    linkedin: "https://www.linkedin.com/in/anshvg",
    writeup: `Hi, I’m Ansh Gupta, a Year 11 student at Dubai International Academy Emirates Hills and a self-taught web developer who loves turning ideas into clean, useful digital products. I work across the stack with HTML, CSS, JavaScript, React, TypeScript, and PHP, and I’m always experimenting with new tools to improve performance, reliability, and user experience.

Beyond coding, I enjoy leading tech initiatives across school clubs and events, mentoring peers, and collaborating on projects that blend design, data, and problem-solving. I’m multilingual (English, Hindi, and Chinese with HSK certifications) and actively involved in academic and tech competitions, which has shaped my approach to teamwork, communication, and creative thinking.

For VOFMUN, I serve as Head of Technology, where I keep things running smoothly behind the scenes and create the conference’s digital platforms, including the VOFMUN One web app and the site on which you are reading this.

See more on my website: `,
    websiteLink: "https://www.anshgupta.site",
  },
  {
    name: "Aryan Shah",
    role: "<strong>Head of Committees</strong>",
    department: "Committees",
    image: "/founders/AryanShah_Committees.jpg",
    bio: "Leading committee curation, topic development, and delegate support for VOFMUN 2026.",
    writeup: `Hi I'm Aryan Shah, Head of Committees for VOFMUN 2026! I have previously participated in 4 MUN conferences, and have received an honorable mention in one of them. I am currently a Year 11 student at Dubai International Academy. I am also Vice-President of my school's Cubing and AI clubs. Outside of school I have organised and hosted multiple internationally recognized and licensed Rubik's Cube Competitions that have attracted the attention of some of the best cubers in the MENA region. At VOFMUN my goal is to ensure that all the delegates have an amazing experience at VOFMUN by handling all committee-related matters that range from finalising topics to country allocation and communication with all delegates.`,
  },
  {
    name: "Clyde Jared Robis",
    role: "<strong>Co-Head of Logistics</strong>",
    department: "Logistics",
    image: "/founders/ClydeJaredRobis_Logistics.jpg",
    bio: "Coordinating large-scale logistics and operational readiness for the conference.",
    writeup: `Hello delegates, chairs, and dear readers. My name is Jared Robis (the existence of the first name ‘Clyde’ is false), and I am the Co-Head of Logistics at Voices of the Future MUN 2026. I’ve attended various MUNs such as GFSMUN V and QuixMUN, and I plan to participate in many more in the coming years. I’m currently in Year 11 at GEMS Metropole School, where I’ve developed key skills in management, leadership, teamwork, and effective communication.

These skills directly support my role at VOFMUN, where I help coordinate the logistical operations that ensure the smooth functioning of the conference. I look forward to seeing you all at VOFMUN 2026 - stay tuned!`,
  },
  {
    name: "Elinore Sweiss",
    role: "<strong>Co-Head of Logistics</strong>",
    department: "Logistics",
    image: "/founders/ElinoreSweiss_Logistics.jpg",
    bio: "Ensuring every logistical detail contributes to a seamless delegate experience.",
    writeup: `Hi, I’m Elinore Sweiss, Co-Head of Logistics for VOFMUN 2026! I’ve participated in several MUNs, gaining awards such as Best Research, which have helped me build confidence in public speaking, leadership, and diplomacy. Beyond MUN, I’ve excelled in academics, music, sports, and art, achieving a Distinction in ABRSM Grade 5 Piano and am currently working on Piano Grade 6. I also train in rhythmic gymnastics, winning 2nd overall and 3rd overall at separate competitions, and a Grade 8 at my End of Year art exam.

These experiences have sharpened my discipline, problem-solving, and organizational skills. At VOFMUN 2026, I am excited to use these strengths as Co-Head of Logistics, ensuring everything runs seamlessly.`,
  },
  {
    name: "Vaibhav K. Mundanat",
    role: "<strong>Co-Head of Media</strong>",
    department: "Media",
    image: "/founders/VaibhavMundanat_Media.png",
    bio: "Crafting storytelling and coverage that bring the VOFMUN journey to life.",
    linkedin: "https://www.linkedin.com/in/vaibhav-mundanat-7045b3379",
    writeup: `Hi, my name is Vaibhav Mundanat (aka “V”) and I am in Year 11 at Dubai International Academy Emirates Hills. I have had 8+ MUN Conferences as a Delegate, 2 experiences as a Chair, and am Deputy Head of Admin for DIAMUN’26. I am currently part of the Media & Marketing Team. I enjoy playing the piano, baking, discussing socio-economic factors, and anything medicine/biology related. I cannot wait to see you at VOFMUN I 2026.`,
  },
  {
    name: "Gibran Malaeb",
    role: "<strong>Co-Head of Media</strong>",
    department: "Media",
    image: "/founders/GibranMalaeb_Media.jpg",
    bio: "Leading media initiatives that highlight VOFMUN’s community and impact.",
    linkedin: "https://www.linkedin.com/in/gibran-m-a99153298",
    writeup: `Hello everyone! My name is Gibran and I am a Year 10 student at GEMS Metropole School Motor City, passionate about STEM, especially mathematics and computer science. As Co-Head of Media at Voices of the Future MUN, I keep the Media team organized and focused, helping maintain a strong media presence. I am enthusiastic about Model UN and look forward to taking on more active roles in future conferences.

Beyond academics and MUN, I serve as house captain and student council member, contribute to my school's robotics club, and participate in debate, public speaking, and cross country. Music is essential to me; I play the violin, saxophone, and piano. I am fluent in French, Arabic, and English, and hold beginner to intermediate proficiency in German and Spanish. Inspired by Maya Angelou’s words, “I rise,” I am motivated to persevere and support my team at VOFMUN and beyond.`,
  },
  {
    name: "Armaghan Siddiqui",
    role: "<strong>Head of Finance</strong>",
    department: "Finance",
    image: "/founders/MuhammadArmaghanSiddiqui_Finance.png",
    bio: "Overseeing budgeting, partnerships, and sustainable growth for the conference.",
    linkedin: "https://www.linkedin.com/in/armaghan-siddiqui-000309345",
    writeup: `Hi, my name is Armaghan Siddiqui and I’m excited to be part of the Finance Team for VOFMUN this year. I’ve always been passionate about taking on challenges that push me to think creatively, lead with purpose, and work collaboratively with others. Over the years, I’ve participated in a range of MUNs, debate competitions, and student-led initiatives that have helped me develop my skills in communication, organization, and leadership.

These experiences have also deepened my interest in how teamwork and careful planning come together to create successful events. I’m especially drawn to the finance aspect of VOFMUN because it allows me to combine analytical thinking with creativity to help ensure everything runs seamlessly behind the scenes. Above all, I’m looking forward to working alongside an incredible team to make this conference a truly impactful and memorable experience for everyone involved.`,
  },
];

const deputies: SecretariatMember[] = [
  {
    name: "Muhammad Talha Solail",
    role: "<strong>Deputy of Committees</strong>",
    department: "Committees",
    image: "/founders/MuhammadTalhaSolail_Committees.png",
    bio: "Supporting committee preparation, research, and delegate engagement initiatives.",
    writeup: `Hi I'm Muhammad Talha, Deputy of Committees for VOFMUN 2026! I have previously participated in 8 MUN conferences, and received one Best Delegate and Best Research awards. I am currently a Year 11 student at GEMS Metropole School. I am also part of Global Innovation and the Maker & Coders clubs at my school while out of school I am a part of the Waterloo Computer Science tournament and Dubai Science Fair. At VOFMUN my goal is to assist in ensuring all committees are well established and functional to the MUN.`,
  },
  {
    name: "Reem Ghanayem",
    role: "<strong>Deputy of Logistics</strong>",
    department: "Logistics",
    image: "/founders/ReemGhanayem_Logistics.jpg",
    bio: "Helping deliver logistics planning, venue coordination, and delegate services.",
    writeup: `Hello I'm Reem Ghanayem - one of the Deputies of Logistics for VOFMUN 2026! I have previously participated in the Emirates Literature Festival. I also am passionate about dance, play piano, have worked in marketing before, and enjoy public speaking. I speak Arabic and English.

I am currently a Year 11 student at GEMS Metropole School, Motor City. I am also part of the Theatre program at my school. At VOFMUN my goal is to ensure the MUN goes smoothly and to essentially help plan the logistics aspects of the MUN behind the scenes including, venue, scheduling, and more! Looking forward to seeing you all join VOFMUN`,
  },
  {
    name: "Gabrielle Zietsman",
    role: "<strong>Deputy of Logistics</strong>",
    department: "Logistics",
    image: "/founders/GabrielleZietsman_Logistics.png",
    bio: "Coordinating operational details and supporting the logistics leadership team.",
    writeup: `My name is Gabrielle Zietsman, but you can call me Gaby, and I am the Deputy of Logistics for Voices of the Future MUN 2026. I’m currently going into Year 11 at GEMS Metropole School, where I’ve taken on several leadership roles, including Wellbeing Leader and House Captain. You may also recognise me from the school radio on Fridays!

These experiences have strengthened my organisation, teamwork, and communication skills, all of which I apply to my role at VOFMUN, where I support the Head of Logistics in coordinating and managing the operational aspects of the conference. I look forward to seeing you all at VOFMUN 2026!`,
  },
  {
    name: "Ayaan Agrawal",
    role: "<strong>Deputy of Media</strong>",
    department: "Media",
    image: "/founders/AyaanAgrawal_Media.png",
    bio: "Producing engaging multimedia content to showcase VOFMUN's story.",
    writeup: `Hi! I’m Ayaan, and I’m a 15 year old student at DIAEH, currently in Year 11. I have a strong passion for content creation, particularly when it comes to video editing. I enjoy working on creative projects and finding new ways to make videos engaging to the audience and impactful. Content creation has always been something I love because it lets me express ideas visually and tell stories in unique ways. I’m super excited to be part of the VOFMUN team and I look forward to contributing my knowledge, and learning from everyone I work with!`,
  },
  {
    name: "Hanxiao Yu",
    role: "<strong>Deputy of Media</strong>",
    department: "Media",
    image: "/founders/HanxiaoYu_Media.jpg",
    bio: "Amplifying VOFMUN's mission through multilingual media and outreach efforts.",
    writeup: `Hi, my name is Hanxiao Yu, but you can also call me Farah. I can speak 3 languages - Arabic, English and Mandarin, and so if anyone is struggling with languages you can come find me! I'm the Deputy of Media & Marketing for VOFMUN 2026.

I've taken part in the World Scholar's Cup before, so I already have some experience with debating. I'm also a Year 11 student at GEMS Metropole School. At VOFMUN, my goal is to promote and represent the conference, while inspiring others and making sure our media and marketing highlight the vision of the event.`,
  },
  {
    name: "Jaden Shibu",
    role: "<strong>Deputy of Media</strong>",
    department: "Media",
    image: "/founders/JadenShibu_Media.jpg",
    bio: "Combining marketing experience and design to capture the energy of VOFMUN.",
    linkedin: "https://www.linkedin.com/in/jaden-shibu-51316637a",
    writeup: `I’m Jaden, a Year 12 student at Cambridge International School (CIS) and a member of the Media Team for VOFMUN. I’ve gained prior experience in marketing and event activations through internships and have participated in numerous MUNs as both a delegate and a chair, over time, I've developed a strong passion for diplomacy, communication, and design. Alongside my MUN involvement, I also hold leadership roles at school that have strengthened my teamwork, organization, and leadership skills. I’m excited to contribute to VOFMUN this year and capture the energy and collaboration that make the conference special.`,
  },
  {
    name: "Tamara Moshawrab",
    role: "<strong>Deputy of Media</strong>",
    department: "Media",
    image: "/founders/TamaraMoshawrab_Media.png",
    bio: "Supporting media strategy with business insight and a passion for storytelling.",
    writeup: `Hello! My name is Tamara Moshawrab, and I’m a Year 11 student at SABIS International School of Choueifat Dubai. I’m thrilled to serve as Deputy of Media for Voices of the Future MUN 2026, where I help manage communications and create engaging content to connect with delegates and showcase the conference experience.

Academically, I study IGCSE Business and AP Economics, which have strengthened my analytical and organisational skills - skills I bring into planning and managing media for VOFMUN. Outside of school, I’m passionate about debate, MUN, and tennis, all of which help me develop focus, creativity, and teamwork. I’m excited to contribute to making VOFMUN 2026 a memorable and inspiring conference for all!`,
  },
  {
    name: "Noya Fareed",
    role: "<strong>Deputy of Media</strong>",
    department: "Media",
    image: "/founders/NoyaFareed_Media.jpeg",
    bio: "Driving creative media projects that celebrate the VOFMUN community.",
    writeup: `Hello everyone, my name is Noya Fareed, I’m 15 years old and I’m from India and Pakistan. I currently go to MTS, and I’m so excited to be part of this project as one of the Deputies of Media. I’ve had three MUN experiences, where I’ve learned so much about leadership, diplomacy, and public speaking. Along with that, I’ve also taken on media roles for different projects, working on content creation, event coverage, and promotion - which helped me grow creatively and work well in a team. I’m really looking forward to bringing that same energy and enthusiasm here, and I can’t wait to collaborate with everyone to make this project a success.`,
  },
  {
    name: "Pranav Verma",
    role: "<strong>Deputy of Finance</strong>",
    department: "Finance",
    image: "/founders/PranavVerma_Finance.jpg",
    bio: "Managing sponsorships, partnerships, and budgeting for a resilient conference.",
    linkedin: "https://www.linkedin.com/in/pranav-verma-136309371",
    writeup: `Hi, I’m Pranav Verma, a member of the Finance Team at VOFMUN 2026, where I help manage budgeting, sponsorship, and partnerships to ensure the smooth execution and financial sustainability of the conference.

Over the years, I’ve been deeply involved in student leadership and event management, including co-organizing my school’s QuizBowl competition, which drew participation across year levels and required detailed budgeting, scheduling, and logistics planning. I also played a key role in helping plan a large-scale community Holi event, where I coordinated vendors, managed costs, and handled outreach to sponsors - an experience that strengthened my financial and organizational skills.

Beyond event management, I’m passionate about sustainability and innovation. My Personal Project focused on creating eco-friendly fast food packaging, and my Community Project involved building a mini hydroponic farm at school. These initiatives reflect my interest in using creativity and problem-solving to drive real impact.

At VOFMUN, I aim to bring that same precision and initiative - ensuring every financial decision contributes to a conference that’s not only professional and impactful, but also forward-thinking and inclusive.`,
  },
  {
    name: "Noaf Qassem",
    role: "<strong>Deputy of Finance</strong>",
    department: "Finance",
    image: "/founders/NoafQassem_Finance.png",
    bio: "Supporting strategic planning and financial stewardship for VOFMUN.",
    writeup: `I'm Noaf Qassem, a Year 11 student at SABIS International School of Choueifat Dubai, and I'm incredibly proud to be serving as the Deputy of Finance of Voices of the Future 2026! Being part of the VOFMUN leadership has given me the opportunity to contribute to something meaningful while building valuable skills in organization, teamwork, and strategic planning. I've chosen to take IGCSE Business, AP Economics, and AP Statistics - subjects that reflect my deep interest in global systems, economic theory, and data-driven decision-making.

My future aspirations lie in either diplomacy or economics, and I believe that understanding the mechanics of both global policy and financial systems will prepare me to make a real impact in those fields. MUN has always been a space where I've been able to grow - not just as a speaker and thinker, but as a global citizen. I love the way it challenges me to think critically, communicate clearly, and collaborate with others to solve complex issues. Outside of academics, I am an ongoing track and field athlete, which helps shape my perspective on core life skills such as discipline, leadership, and respect.

Being part of the VOFMUN team and this great journey has been incredibly exciting, and I'm committed to ensuring the financial planning behind the scenes helps make this conference as smooth, impactful, and unforgettable as possible. Can't wait to see what we accomplish together; hope to see you at VOFMUN 2026!`,
  },
  {
    name: "Caelyn Harding",
    role: "<strong>Deputy of Finance</strong>",
    department: "Finance",
    image: "/founders/CaelynHarding_Finance.png",
    bio: "Championing resource planning that elevates every delegate experience.",
    writeup: `Hey! My name is Caelyn. I go to GEMS Metropole School in Motor City, and I’m in Year 11. I’m currently enrolled in my school’s MUN and will be attending the next conference as a delegate. I’m also part of VOFMUN’s Finance Team! I love to debate, draw, and play the piano, but most importantly, I love helping people. I joined the Finance Team to improve everyone’s experience at VOFMUN while also considering the financial and organizational aspects. I hope to use my skills to benefit the team and make VOFMUN as memorable as possible!`,
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
    case "Conference Affairs":
      return Workflow;
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
    case "Conference Affairs":
      return {
        bg: "bg-gradient-to-br from-teal-500 to-teal-700",
        text: "text-white",
        border: "border-teal-500",
        badgeClass: "bg-teal-600 text-white border-0",
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

export default function SecretariatPage() {
  const [hoveredFounder, setHoveredFounder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFounder, setModalFounder] = useState<SecretariatMember | null>(
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

  const openModal = (member: SecretariatMember) => {
    setModalFounder(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalFounder(null);
  };

  const renderMemberCard = (
    member: SecretariatMember,
    index: number,
    variant: "founder" | "head" | "deputy" = "head",
  ) => {
    const IconComponent = getDepartmentIcon(member.department);
    const colors = getDepartmentColor(member.department);
    const hoverKey = `${variant}-${index}`;
    const isHovered = hoveredFounder === hoverKey;

    const cardPadding =
      variant === "founder" ? "p-6 sm:p-8 md:p-10" : variant === "deputy" ? "p-4 sm:p-5" : "p-6";
    const imageSizeClass =
      variant === "founder"
        ? "w-36 h-36 md:w-44 md:h-44"
        : variant === "deputy"
        ? "w-24 h-24"
        : "w-28 h-28";
    const nameClass =
      variant === "founder"
        ? "text-2xl md:text-3xl"
        : variant === "deputy"
        ? "text-base"
        : "text-lg";
    const roleClass =
      variant === "founder"
        ? "text-base md:text-lg"
        : variant === "deputy"
        ? "text-xs"
        : "text-sm";
    const badgeClass =
      variant === "founder"
        ? "inline-block px-5 py-2.5 rounded-full text-sm md:text-base font-medium"
        : variant === "deputy"
        ? "inline-block px-3 py-1.5 rounded-full text-xs font-medium"
        : "inline-block px-4 py-2 rounded-full text-sm font-medium";
    const socialButtonSize = variant === "deputy" ? "w-9 h-9" : "w-12 h-12";
    const socialIconSize = variant === "deputy" ? "w-4 h-4" : "w-5 h-5";
    const linkedinUrl = member.linkedin?.trim() || DEFAULT_LINKEDIN;
    const linkedinLabel = member.linkedin?.trim()
      ? `${member.name} LinkedIn`
      : "VOFMUN LinkedIn";

    return (
      <div
        key={hoverKey}
        className={`relative group cursor-pointer transition-all duration-700 ${
          isHovered ? "transform scale-105 z-10" : ""
        }`}
        onClick={() => openModal(member)}
        onMouseEnter={() => setHoveredFounder(hoverKey)}
        onMouseLeave={() => setHoveredFounder(null)}
      >
        <div
          className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${colors.border}/30 relative overflow-hidden ${
            isHovered ? "shadow-2xl animate-glow" : ""
          } ${cardPadding} ${variant === "founder" ? "max-w-2xl mx-auto" : ""}`}
        >
          <div
            className={`absolute inset-0 ${colors.bg} opacity-5 transition-opacity duration-300 ${
              isHovered ? "opacity-10" : ""
            }`}
          ></div>

          <div
            className={`relative z-10 flex flex-col items-center gap-5 ${
              variant === "founder" ? "md:gap-6" : ""
            }`}
          >
            <div className="flex justify-center">
              <div className={`p-3 ${colors.bg} rounded-full shadow-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className={`relative ${imageSizeClass} rounded-full border-4 ${colors.border} shadow-lg overflow-hidden`}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h3 className={`${nameClass} font-bold text-gray-900 font-serif`}>
                {member.name}
              </h3>
              <p
                className={`${roleClass} text-gray-600 mb-1`}
                dangerouslySetInnerHTML={{ __html: member.role }}
              />
              <span className={`${badgeClass} ${colors.badgeClass}`}>
                {member.department}
              </span>
            </div>

              <div className="flex justify-center">
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${socialButtonSize} bg-[#0077B5] rounded-full flex items-center justify-center hover:bg-[#005885] transition-all duration-300 hover:scale-110 shadow-md`}
                  aria-label={linkedinLabel}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className={`${socialIconSize} text-white`} />
                </a>
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
              Meet the Secretariat
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
              The VOFMUN Secretariat is a collective of founders, heads, and deputies dedicated to
              elevating delegate experiences and advancing youth diplomacy.
            </p>
          </div>
        </section>

        {/* Founders */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#B22222] text-center mb-4 font-serif">
              Founders
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              VOFMUN was co-founded by Tala Swaidan and Vihaan Shukla, whose shared vision continues to guide the
              conference forward.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {foundingSecretariat.map((member, index) =>
                renderMemberCard(member, index, "founder"),
              )}
            </div>
          </div>
        </section>

        {/* Heads */}
        <section className="py-12 bg-[#fff7f0]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#B22222] text-center mb-4 font-serif">
              Heads of Departments
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Department heads transform our mission into action across technology, committees, logistics, media, and finance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {leadershipTeam.map((member, index) =>
                renderMemberCard(member, index, "head"),
              )}
            </div>
          </div>
        </section>

        {/* Deputies */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-600 text-center mb-3 font-serif">
              Deputies
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our deputies partner with heads to keep every initiative responsive, well-coordinated, and memorable for delegates.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {deputies.map((member, index) =>
                renderMemberCard(member, index, "deputy"),
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
                className={`md:w-1/3 ${getDepartmentColor(modalFounder.department).bg} flex flex-col items-center justify-center gap-4 md:gap-5 p-6 md:p-8 text-center`}
              >
                <div className="relative w-full max-w-[14rem] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white/10">
                  <Image
                    src={modalFounder.image}
                    alt={modalFounder.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 60vw, 224px"
                  />
                </div>
                <h2 className="text-white text-2xl font-bold">
                  {modalFounder.name}
                </h2>
                <p
                  className="text-white/90"
                  dangerouslySetInnerHTML={{ __html: modalFounder.role }}
                />
                <span className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white">
                  {modalFounder.department}
                </span>
                <a
                  href={modalFounder.linkedin?.trim() || DEFAULT_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={modalFounder.linkedin?.trim() ? `${modalFounder.name} LinkedIn` : "VOFMUN LinkedIn"}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#0077B5] shadow-md transition-all hover:bg-white hover:scale-105"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
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
