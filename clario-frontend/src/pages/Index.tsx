import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, BarChart3, Flame, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-illustration.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const Index = () => {
  const { t } = useTranslation();
  const featuresI18n = [
    {
      icon: Mic,
      title: t("index.features.voice.title"),
      description: t("index.features.voice.desc"),
    },
    {
      icon: Sparkles,
      title: t("index.features.insights.title"),
      description: t("index.features.insights.desc"),
    },
    {
      icon: Flame,
      title: t("index.features.streak.title"),
      description: t("index.features.streak.desc"),
    },
    {
      icon: BarChart3,
      title: t("index.features.mood.title"),
      description: t("index.features.mood.desc"),
    },
  ];
  const testimonialsI18n = [
    { quote: t("index.testimonials.sarah.quote"), name: "Sarah M.", role: t("index.testimonials.sarah.role") },
    { quote: t("index.testimonials.david.quote"), name: "David K.", role: t("index.testimonials.david.role") },
    { quote: t("index.testimonials.elena.quote"), name: "Elena R.", role: t("index.testimonials.elena.role") },
  ];

  return (
    <div className="min-h-screen bg-background relative">

      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "var(--gradient-glow)" }}
          aria-hidden
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-8">
            <motion.p variants={fadeUp} className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t("index.badge")}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl md:text-7xl font-light leading-[0.95] text-foreground text-balance"
            >
              {t("index.hero_h1_1")}
              <br />
              <span className="font-semibold italic text-primary">{t("index.hero_h1_2")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-body text-lg text-muted-foreground max-w-md leading-relaxed">
              {t("index.hero_desc")}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body text-sm font-medium tracking-wide rounded-full hover:opacity-90 transition-opacity duration-200 shadow-lg"
              >
                <Mic className="w-4 h-4" />
                {t("index.cta")}
              </Link>
            </motion.div>
          </div>
          <motion.div
            variants={fadeUp}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Abstract zen landscape evoking calm and reflection"
                width={1280}
                height={720}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-accent/20 float" />
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-primary/10 float" style={{ animationDelay: "2s" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">{t("index.how_badge")}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-foreground">
              {t("index.how_title_1")} <span className="italic">{t("index.how_title_2")}</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuresI18n.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">{t("index.voices_badge")}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-foreground">
              {t("index.voices_title_1")} <span className="italic">{t("index.voices_title_2")}</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsI18n.map((t, i) => (
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="p-6 rounded-2xl bg-background border border-border/30"
              >
                <p className="font-body text-sm text-foreground/80 leading-relaxed mb-4 italic">
                  "{t.quote}"
                </p>
                <footer className="font-body text-xs text-muted-foreground">
                  <strong className="text-foreground font-medium">{t.name}</strong> · {t.role}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
