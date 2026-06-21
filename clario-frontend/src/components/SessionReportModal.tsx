import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  X,
  Activity,
  Zap,
  Tag,
  MessageSquare,
  Smile,
  Frown,
  Meh,
  Heart,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  SessionDetailData,
  CallReportMoodPoint,
  CallReportThing,
  CallReportInsight,
  CallReportTheme,
} from "@/lib/api";

interface SessionReportModalProps {
  reportData: SessionDetailData;
  onClose: () => void;
}

export default function SessionReportModal({ reportData, onClose }: SessionReportModalProps) {
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  if (!reportData.report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl max-w-sm text-center">
          <p className="text-muted-foreground mb-4">No report data available for this session.</p>
          <button onClick={onClose} className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium transition-transform hover:scale-105">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { report, conversation } = reportData;
  
  const moodDataForChart = report.mood_across_session.map((point: CallReportMoodPoint, index: number) => ({
    time: `Point ${index + 1}`,
    score: point.score,
    label: point.label,
  }));

  const visibleConversation = showFullHistory ? conversation : conversation.slice(-3);

  const getInsightIcon = (type: string) => {
    switch(type) {
      case "pattern": return <Activity className="w-5 h-5 text-blue-500" />;
      case "moment": return <Heart className="w-5 h-5 text-rose-500" />;
      case "suggestion": return <Lightbulb className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-primary" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch(type) {
      case "pattern": return "bg-blue-500/10 border-blue-500/20";
      case "moment": return "bg-rose-500/10 border-rose-500/20";
      case "suggestion": return "bg-amber-500/10 border-amber-500/20";
      default: return "bg-primary/10 border-primary/20";
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case "positive": return <Smile className="w-4 h-4 text-green-500" />;
      case "negative": return <Frown className="w-4 h-4 text-destructive" />;
      default: return <Meh className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const thingNarrative = (thing: CallReportThing) =>
    (thing.narrative?.trim() || thing.label?.trim() || "").trim();

  const reflectionParagraphs = (report.personal_reflection ?? "")
    .trim()
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="min-h-screen p-4 md:p-8 flex justify-center">
        <div className="max-w-4xl w-full bg-card/50 backdrop-blur-3xl rounded-[2rem] border border-border/50 shadow-2xl relative overflow-hidden h-max">
          {/* Header gradient glow */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 p-6 md:p-10">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-1">Session complete</p>
                <h2 className="font-display text-3xl font-semibold text-foreground">Your Synthesis</h2>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-transform hover:scale-105"
                aria-label="Close report"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-background border border-border/50 flex flex-col items-center text-center">
                <span className="font-display text-2xl font-semibold mb-1 capitalize text-primary">{report.one_word_summary}</span>
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Summary</span>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border/50 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Activity className="w-5 h-5 text-accent" />
                  <span className="font-display text-2xl font-semibold">{report.average_mood_rating.toFixed(1)}</span>
                </div>
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Mood Avg</span>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border/50 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-display text-2xl font-semibold">{report.energy_level}/10</span>
                </div>
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Energy</span>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border/50 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="font-display text-2xl font-semibold">{report.user_words_spoken}</span>
                </div>
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Words spoken</span>
              </div>
            </div>

            {/* Overview */}
            <div className="mb-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h3 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Session Overview
              </h3>
              <div className="space-y-3">
                {report.session_overview.map((sentence: string, i: number) => (
                  <p key={i} className="font-body text-foreground/80 leading-relaxed text-lg">
                    {sentence}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Mood Chart */}
              <div className="p-6 rounded-2xl bg-background border border-border/50">
                <h3 className="font-display text-lg font-medium text-foreground mb-6">Mood Progression</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodDataForChart}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 10]} hide />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
                                <p className="font-body text-sm text-foreground">Score: {payload[0].value}</p>
                                <p className="font-body text-xs text-muted-foreground capitalize mt-1">Found feeling: {payload[0].payload.label}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                        activeDot={{ r: 8, fill: "hsl(var(--accent))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Themes & Things Done */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-background border border-border/50">
                  <h3 className="font-display text-lg font-medium text-foreground mb-4">Themes Discussed</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.themes_discussed.map((theme: CallReportTheme, i: number) => (
                      <div key={i} className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-body text-sm flex items-center gap-2" title={theme.summary}>
                        <Tag className="w-4 h-4 opacity-50" />
                        {theme.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-background border border-border/50 flex-1">
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">Things I did and held</h3>
                  <p className="font-body text-xs text-muted-foreground mb-4 leading-relaxed">
                    In your voice — a little longer, first person.
                  </p>
                  <div className="space-y-5">
                    {report.things_you_did_today.map((thing: CallReportThing, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-card border border-border/30 space-y-3"
                      >
                        <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {thingNarrative(thing) || "—"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30">
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider px-2 py-1 rounded bg-secondary/50">
                            {thing.category}
                          </span>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {getSentimentIcon(thing.sentiment)}
                            <span className="font-body text-xs capitalize">{thing.sentiment}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            {report.insights.length > 0 && (
              <div className="mb-10">
                <h3 className="font-display text-xl font-medium text-foreground mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.insights.map((insight: CallReportInsight, i: number) => (
                    <div key={i} className={`p-5 rounded-2xl border ${getInsightBg(insight.type)}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {getInsightIcon(insight.type)}
                        <span className="font-body text-xs uppercase tracking-wider font-semibold capitalize opacity-80">{insight.type}</span>
                      </div>
                      <p className="font-body text-sm leading-relaxed text-foreground/90">{insight.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal reflection — full journal entry */}
            {reflectionParagraphs.length > 0 ? (
              <div className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-b from-accent/8 to-transparent border border-accent/15">
                <h3 className="font-display text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent shrink-0" />
                  Personal reflection
                </h3>
                <p className="font-body text-xs text-muted-foreground mb-6 max-w-prose">
                  Your space — written as you might in a private journal, with room for the whole story.
                </p>
                <div className="space-y-5 max-w-prose">
                  {reflectionParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className="font-body text-[15px] md:text-base text-foreground/90 leading-[1.75] tracking-[0.01em]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-10 p-6 rounded-2xl border border-dashed border-border/60 bg-muted/10">
                <h3 className="font-display text-lg font-medium text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  Personal reflection
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  No long-form reflection stored for this session (older reports). Generate a new report on a future session to see this section filled in.
                </p>
              </div>
            )}

            {/* Conversation History */}
            <div className="mt-12 border-t border-border/50 pt-8">
              <h3 className="font-display text-xl font-medium text-foreground mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                Conversation Transcript
              </h3>
              
              <div className="bg-background rounded-2xl border border-border/50 overflow-hidden flex flex-col">
                <div className="max-h-96 overflow-y-auto p-6 space-y-6 slim-scrollbar">
                  {visibleConversation.map((turn, i) => {
                    const isUser = turn.role === "user";
                    return (
                      <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          isUser 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-secondary text-secondary-foreground rounded-tl-sm"
                        }`}>
                          <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{turn.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {conversation.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No conversation transcript recorded.</p>
                  )}
                </div>
                
                {conversation.length > 3 && (
                  <div className="border-t border-border/50 p-4 bg-muted/20 flex justify-center shrink-0 mt-auto">
                    <button
                      onClick={() => setShowFullHistory(!showFullHistory)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/50 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      {showFullHistory ? "Show Less" : `Load Full Transcript (${conversation.length - 3} more)`}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFullHistory ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={onClose}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium transition-transform hover:scale-105 shadow-xl shadow-primary/20"
              >
                Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
