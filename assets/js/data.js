/* All portfolio content lives here. Edit this file to change the site. */
window.SITE = {
  name: "Mezzy Echavez",
  short: "Mezzy",
  email: "mezzyechavez637@gmail.com",
  facebook: "https://www.facebook.com/mezzie.echavez",
  github: "https://github.com/mezzyechavez637-design",
  photo: "",
  marquee: "Mezzy Echavez • Builder • Learner •",
  roles: [
    "BSIT Student at NORSU",
    "Front-End Web Developer",
    "Network & Design Enthusiast",
    "Always Shipping Something"
  ],
  intro: "I build small, practical things for the web and I'm happy to explain how they work. Right now I'm a 3rd-year IT student who learns fastest by making something, breaking it, then fixing it properly.",
  stats: [
    { label: "Projects built", value: 5 },
    { label: "Tools practiced", value: 9 },
    { label: "Years studying IT", value: 3 },
    { label: "Cups of coffee", value: 999 }
  ],
  about: {
    heading: "Curious first,\ncode second.",
    intro: "I'm Mezzy, an Information Technology student from Negros Oriental. I like understanding how a system fits together before I build on top of it.",
    cards: [
      { title: "Where I started", text: "I studied Accountancy, Business, and Management at Southern Tech College before moving into Information Technology in 2024." },
      { title: "What I study", text: "I'm taking a BSIT degree at Negros Oriental State University, and I enjoy web design, networks, and animation." },
      { title: "Where I'm headed", text: "I want to join a team where I can contribute early, learn from experienced people, and grow into a reliable web developer." }
    ],
    interests: ["Web Development", "UI Design", "Network Layout", "2D Animation", "Cisco Packet Tracer", "Problem Solving", "Creativity", "Teamwork"],
    values: [
      { icon: "🧩", title: "Break it down", text: "Big problems become small steps I can actually finish." },
      { icon: "🔁", title: "Iterate", text: "First version works. Second version is clean. Third is fast." },
      { icon: "🤝", title: "Share", text: "Honest feedback and teamwork make everyone faster." }
    ]
  },
  skills: [
    { name: "HTML5 & CSS3", cat: "Web", level: 85, text: "Clean page structure, tidy styling, and layouts that adapt to any screen." },
    { name: "JavaScript", cat: "Web", level: 60, text: "Making pages interactive: menus, filters, forms, and small animations." },
    { name: "Bootstrap", cat: "Web", level: 70, text: "Building responsive layouts quickly with ready-made components." },
    { name: "Responsive Web Design", cat: "Web", level: 80, text: "Pages that look right on phones, tablets, and computers." },
    { name: "UI/UX Design", cat: "Design", level: 65, text: "Clear layouts, readable spacing, and screens that make sense at first glance." },
    { name: "Figma & Canva", cat: "Design", level: 75, text: "Planning and designing web pages and graphics before building them." },
    { name: "Cisco Packet Tracer", cat: "Networking", level: 70, text: "Building, configuring, and testing simulated networks." },
    { name: "2D Animation", cat: "Design", level: 60, text: "Timing and movement that keep a scene easy to follow." },
    { name: "Network Layout Design", cat: "Networking", level: 65, text: "Planning and testing connected devices in a simulated network." }
  ],
  projects: [
    { id: "kiosk", title: "Figma/Canva Web Design", cat: "Web", status: "Completed", year: 2025, img: "assets/images/kiosktogo-pos.jpg",
      short: "A clean, easy-to-use web interface design.",
      long: "A web design project focused on layout, spacing, and clear steps, so a first-time visitor can understand the screen without instructions.",
      tags: ["Figma", "Canva", "UI/UX Design"], learned: "Designing for speed and clarity matters more than adding features." },
    { id: "network", title: "Network Layout Design", cat: "Networking", status: "Completed", year: 2025, img: "assets/images/cisco-packet-tracer.jpg",
      short: "A structured multi-device network built and tested in Cisco Packet Tracer.",
      long: "A simulated network with routers, switches, and end devices. I planned the addressing, configured the devices, and tested connectivity between segments until every ping succeeded.",
      tags: ["Cisco Packet Tracer", "Networking", "IP Addressing"], learned: "Plan the addressing first. Debugging a bad plan costs far more than making a good one." },
    { id: "animate", title: "2D Animation", cat: "Designs", status: "Completed", year: 2025, img: "assets/images/animate-project.jpg",
      short: "A short animation exploring movement, timing, and visual storytelling.",
      long: "An Adobe Animate project where I practiced timing, easing, and keeping a scene readable while many things move at once.",
      tags: ["Adobe Animate", "Animation"], learned: "Timing is half of the story.", link: "https://www.facebook.com/share/v/1A2hfbajcm/", linkLabel: "Watch the video" },
    { id: "illustrator", title: "Cisco Packet Tracer", cat: "Networking", status: "Completed", year: 2025, img: "assets/images/illustrator-project.jpg",
      short: "A simulated network built, configured, and tested in Cisco Packet Tracer.",
      long: "A Cisco Packet Tracer project where routers, switches, and end devices are connected, configured, and tested until everything can communicate.",
      tags: ["Cisco Packet Tracer", "Networking"], learned: "Constraints in color and shape usually make a design stronger." },
    { id: "portfolio", title: "Personal Portfolio Website", cat: "Web", status: "Ongoing", year: 2026, img: "assets/images/home.jpg",
      short: "A warm, multi-page portfolio with searchable projects, self-rated skills, and a working contact flow.",
      long: "Built with plain HTML, CSS, and JavaScript. Content is stored in one data file so updating the site is as simple as editing text.",
      tags: ["HTML", "CSS", "JavaScript"], learned: "A static site can still feel like an app.", link: "index.html", linkLabel: "Open home page" }
  ],
  education: [],
  experience: [],
  whyHire: ""
};
