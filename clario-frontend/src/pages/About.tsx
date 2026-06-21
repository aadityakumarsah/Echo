import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const team = [
  { name: "Aaditya Kumar Sah", title: "Co-Founder", bio: "Aaditya is the co-founder of Clario. He is a software engineer and a mental health advocate." },
  { name: "Shubham Shakya", title: "Co-Founder", bio: "Shubham is the co-founder of Clario. He is a software engineer and a mental health advocate." },
  { name: "Subash Khatri", title: "Co-Founder", bio: "Subash is the co-founder of Clario. He is a software engineer and a mental health advocate." },
  { name: "Suyasa Sigdel", title: "Co-Founder", bio: "Suyasa is the co-founder of Clario. He is a software engineer and a mental health advocate." },
  { name: "Swastik Bhandari", title: "Co-Founder", bio: "Swastik is the co-founder of Clario. He is a software engineer and a mental health advocate." },
];

const About = () => {
  const { t } = useTranslation();
  const techItems = [
    { label: t("about.tech.voice.label"), desc: t("about.tech.voice.desc") },
    { label: t("about.tech.privacy.label"), desc: t("about.tech.privacy.desc") },
    { label: t("about.tech.adaptive.label"), desc: t("about.tech.adaptive.desc") },
  ];

  return (
    <div className="min-h-screen bg-background relative">

      <Navbar />

      {/* Mission */}
      <section className="pt-32 pb-16 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.p variants={fadeUp} className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-6">
            {t("about.badge")}
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-6xl font-light text-foreground mb-8 text-balance leading-tight">
            {t("about.title_1")}{" "}
            <span className="italic text-primary">{t("about.title_2")}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-body text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t("about.desc")}
          </motion.p>
        </motion.div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-light text-center mb-14"
          >
            {t("about.team_title_1")} <span className="italic">{t("about.team_title_2")}</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <span className="font-display text-lg font-semibold text-primary">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="font-body text-xs uppercase tracking-widest text-accent mt-1 mb-3">{member.title}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">{t("about.approach_badge")}</p>
            <h2 className="font-display text-3xl font-light text-foreground mb-8">
              {t("about.approach_title_1")} <span className="italic">{t("about.approach_title_2")}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {techItems.map((item, i) => (
                <div key={i} className="p-5 rounded-xl bg-background border border-border/30">
                  <h4 className="font-body text-sm font-semibold text-foreground mb-2">{item.label}</h4>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
