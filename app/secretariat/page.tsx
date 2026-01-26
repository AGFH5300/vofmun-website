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
    role: "<strong>Founder <br/>Secretary-General</strong>",
    department: "Core",
    image: "/founders/TalaSwaidan_SG.jpg",
    bio: "Co-founder guiding VOFMUN's vision for inclusive and empowering youth diplomacy.",
    linkedin: "https://www.linkedin.com/in/tala-swaidan-401547216",
    writeup: `Hello! My name is Tala Swaidan, and I have the great honor and privilege of serving as the Founder and Secretary-General of Voices of the Future Model United Nations (VOFMUN) alongside my fantastic founding secretariat team. 

VOFMUN all began as an abstract idea shared among friends. But with time, dedication, and great effort, it grew into something far more meaningful: a platform for courageous MUN delegates to engage in diplomacy, express their perspectives, and take on global issues with confidence and purpose.

Beyond my work with VOFMUN, I am an active member of my school's Digital Innovation and Technology team, have been deeply involved in Model United Nations for several years and have participated in over 15 Model United Nations conferences, with an extensive range of various awards. Moreover, I am the founder of my school’s STEM Society, where I lead workshops and projects to inspire students to explore science and innovation beyond the classroom. I also pursue my passions in sports, particularly basketball and kickboxing with MVP recognitions, which have both taught me the value of discipline, teamwork, and perseverance. Furthermore, I am deeply passionate about medicine and aspire to pursue it in the future.

I hope to expand my horizons during the next academic year, working on initiatives such as GenAid, a youth-led nonprofit initiative dedicated to promoting dignity, hygiene, and health access in underserved communities, and on the first VOFMUN conference, taking place in March 2026. Through all my endeavors, I strive to foster positive change, empower others, and lead with integrity.

As VOFMUN continues to grow, my hope is that it remains a space where young leaders can find their voice, challenge their thinking, and leave inspired to shape a better world. VOFMUN strives to empower young people, cultivate leadership, and amplify every voice; the Voices of the Future. I'm incredibly proud of how far we've come - and even more excited for what's ahead. See you soon at VOFMUN 2026!`,
  },
  {
    name: "Vihaan Shukla",
    role: "<strong>Co-Founder <br/>Director-General</strong>",
    department: "Core ",
    image: "/founders/VihaanShukla_ConferenceAffairs.png",
    bio: "Co-founder overseeing conference operations, logistics, and delegate experience design.",
    linkedin: "https://www.linkedin.com/in/vihaanshukla",
    writeup: `Hi, I’m Vihaan Shukla, Co-Founder and Director General at VOFMUN 2026!

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
    name: "Vaibhav Kiran Mundanat",
    role: "<strong>Co-Head of Committees</strong>",
    department: "Committees",
    image: "/founders/VaibhavMundanat_Media.png",
    bio: "Co-leading committee strategy, quality, and delegate experience for VOFMUN 2026.",
    linkedin: "https://www.linkedin.com/in/vaibhav-mundanat-7045b3379",
    writeup: `Hi, my name is Vaibhav Mundanat (aka “V”) and I am in Year 11 at Dubai International Academy Emirates Hills. I have had 8+ MUN Conferences as a Delegate, 2 experiences as a Chair, and am Deputy Head of Admin for DIAMUN’26. I am currently part of the Media & Marketing Team. I enjoy playing the piano, baking, discussing socio-economic factors, and anything medicine/biology related. I cannot wait to see you at VOFMUN I 2026.`,
  },
  {
    name: "Vidur Aravind Kumar",
    role: "<strong>Co-Head of Committees</strong>",
    department: "Committees",
    image: "/founders/VidurKumar_Committees.jpeg",
    bio: "Overseeing committee quality, background guide direction, and delegate experience.",
    linkedin: "https://www.linkedin.com/in/vidur-ak",
    writeup: `Hi, I'm Vidur Kumar, Co-Head of Committees at VOFMUN 2026 and a Year 11 student at Dubai International Academy, Emirates Hills. I'm a student leader with experience in multiple school organisations, including Water for Life, World Scholars Cup Club, and DIAMUN 2026.

Through these roles, I've developed strong skills in communication, logistics, event planning, and team coordination. I've also participated in six MUN conferences, gaining experience in different committees and topics. This has helped me create structured and intellectually engaging committee environments.

As Co-Head of Committees at VOFMUN 2026, I oversee committee quality, background guide direction, and delegate experience. My goal is to create a dynamic, professional, and impactful conference for all delegates. I value clarity, fairness, and constructive dialogue, and I enjoy supporting delegates in building their research, diplomacy, and public speaking skills.`,
  },
  {
    name: "Vyom Patel",
    role: "<strong>Head of Logistics</strong>",
    department: "Logistics",
    image: "/founders/VyomPatel_Logistics.png",
    bio: "Leading logistics planning to deliver a smooth and engaging conference experience.",
    writeup: `Hey everyone, my name is Vyom Patel and it is my pleasure to serve as the Head of Logistics for VOFMUN 2026.

I study at Gems Founders School Al Barsha in year 10 and I am 14 years old. some of my hobbies are playing the guitar, playing basketball and 8-ball pool.

 I started my MUN journey in year 6 and since then I have done 16 MUN conferences: 10 as a delegate, 5 as a chair and 1 as part of the Secretariat, with over 5 awards.

Beyond MUNs, I enjoy public speaking as a whole. I am the president of the JLT Gavel Club, a forum for people to develop their public speaking skills from ages 8-18. I have also participated in various debate competitions hosted by schools while even judging some and I am part of the GFSMUN Secretariat team. I am part of the sustainability council and one of the leaders of the HPL team in my school. 

I hope to see all of you at VOFMUN 2026 because it is an incredible experience for delegate, chair or admin alike. I, along with the entire team, look forward to making this conference a huge success.`,
  },
  {
    name: "Gibran Malaeb",
    role: "<strong>Head of Media & Marketing</strong>",
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
    name: "Arsh Saxena",
    role: "<strong>Deputy of Committees</strong>",
    department: "Committees",
    image: "/founders/ArshSaxena_Committees.jpeg",
    bio: "Supporting committee quality, alignment, and delegate experience initiatives.",
    linkedin: "https://www.linkedin.com/in/arsh-saxena-798408290/",
    writeup: `Hi, I'm Arsh Saxena, Deputy Head of Committees at VOMUN 2026 and a Year 11 student at Dubai International Academy, Emirates Hills. I’m an active student leader involved in multiple school initiatives, from academic clubs to service-based organisations. These experiences have shaped how I approach leadership: with purpose, curiosity, and a focus on elevating the people around me.

Beyond my formal roles, I’ve built a rep for being that person who keeps things moving — whether it’s helping streamline planning, stepping in to fix last-minute issues, or supporting teams when the workload hits. I like bringing order to chaos, staying organised under pressure, and making sure everyone feels confident in what they’re doing.

As Deputy Head of Committees, I support the Co-Heads in managing committee quality, coordinating background guide development, and ensuring each chairing team is aligned and prepared. I help oversee logistics, communication, and the overall delegate experience, making sure committees run smoothly from prep to conference day. My aim is to create a well-structured, fair, and engaging environment where delegates can genuinely grow — in research, diplomacy, and public speaking.`,
  },
  {
    name: "Aryan Shah",
    role: "<strong>Deputy of Logistics</strong>",
    department: "Logistics",
    image: "/founders/AryanShah_Committees.jpg",
    bio: "Supporting logistical planning, coordination, and on-site readiness for VOFMUN.",
    writeup: `Hi I'm Aryan Shah, Deputy of Logistics for VOFMUN 2026! I have previously participated in 4 MUN conferences, and have received an honorable mention in one of them. I am currently a Year 11 student at Dubai International Academy. I am also Vice-President of my school's Cubing and AI club. Outside of school I have organised and hosted multiple internationally recognized and licensed Rubik's Cube Competitions that have attracted the attention of some of the best cubers in the MENA region. At VOFMUN my goal is to ensure that all the delegates have an amazing experience at VOFMUN by handling all committee-related matters that range from finalising topics to country allocation and communication with all delegates.`,
  },
  {
    name: "Saira Shirvaikar",
    role: "<strong>Deputy of Media & Marketing</strong>",
    department: "Media",
    image: "/founders/SairaShirvaikar_Media.jpeg",
    bio: "Amplifying VOFMUN's mission through multilingual media and outreach efforts.",
    linkedin: "https://www.linkedin.com/in/saira-shirvaikar-49839431b",
    writeup: `Hi, I’m Saira Shirvaikar, the Deputy Head of Media and Marketing for VOFMUN 2026. I am a Year 12 student at Jumeirah College and currently serve as Deputy Head of Media for JCMUN. I have also participated in F1 in Schools, working as a Graphic Designer in 2024, where I supported my team in winning the national Best Marketing award, and as a Business Manager in 2025, achieving a second-place national finish.`,
  },
  {
    name: "Tamara Moshawrab",
    role: "<strong>Deputy of Media & Marketing</strong>",
    department: "Media",
    image: "/founders/TamaraMoshawrab_Media.png",
    bio: "Supporting media strategy with business insight and a passion for storytelling.",
    writeup: `Hello! My name is Tamara Moshawrab, and I’m a Year 11 student at SABIS International School of Choueifat Dubai. I’m thrilled to serve as Deputy of Media for Voices of the Future MUN 2026, where I help manage communications and create engaging content to connect with delegates and showcase the conference experience.

Academically, I study IGCSE Business and AP Economics, which have strengthened my analytical and organisational skills - skills I bring into planning and managing media for VOFMUN. Outside of school, I’m passionate about debate, MUN, and tennis, all of which help me develop focus, creativity, and teamwork. I’m excited to contribute to making VOFMUN 2026 a memorable and inspiring conference for all!`,
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
];

const getDepartmentIcon = (department: string) => {
  switch (department) {
    case "Core":
      return Briefcase;
    case "Committees":
      return Users;
    case "Technology":
      return Cpu;
    case "Core ":
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
    case "Core ":
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
