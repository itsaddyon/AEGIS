import React from "react";
import { CheckCircle2, Play, Circle, Search, Activity, HelpCircle } from "lucide-react";

interface OnboardingGuideProps {
  currentStep: number;
  onDismiss?: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ currentStep, onDismiss }) => {
  const steps = [
    {
      id: 1,
      title: "Select Network Interface",
      description: "Pick where you want VISTA to listen. VISTA can capture traffic from your Wi-Fi card, Ethernet, or Loopback.",
      icon: Search
    },
    {
      id: 2,
      title: "Start Capturing",
      description: "Click the 'Start Capture' button to begin listening. VISTA will boot up Scapy or start the mock engine.",
      icon: Play
    },
    {
      id: 3,
      title: "Observe Live Traffic",
      description: "Watch live packets populate the stream. Check the graphs to see which protocol is generating the most traffic.",
      icon: Activity
    },
    {
      id: 4,
      title: "Inspect and Learn",
      description: "Click on any captured packet in the table to open its detailed inspector, decode headers, and view raw content.",
      icon: HelpCircle
    }
  ];

  return (
    <div className="glass-panel p-5 rounded-lg shadow-sm border border-border dark:border-border-dark bg-white/85 dark:bg-charcoal/80 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-border dark:border-border-dark pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse"></div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal dark:text-[#52a39c]">
            Beginner's Quickstart Guide
          </h2>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-slate hover:text-[#3A4048] dark:hover:text-[#EFEDE6] transition-colors cursor-pointer"
          >
            Dismiss Guide
          </button>
        )}
      </div>

      {/* Progress Line */}
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded border transition-all duration-200 ${
                isActive
                  ? "bg-teal/5 border-teal dark:border-[#52a39c] dark:bg-[#3F7D77]/5 scale-[1.02] shadow-sm glow-teal"
                  : isCompleted
                  ? "bg-surface-muted/40 border-border dark:bg-graphite/40 dark:border-border-dark opacity-75"
                  : "bg-transparent border-transparent opacity-50"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-teal dark:text-[#52a39c]" />
                  ) : isActive ? (
                    <Circle size={16} className="text-teal dark:text-[#52a39c] fill-teal/20 animate-pulse" />
                  ) : (
                    <Circle size={16} className="text-slate-light" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-light">STEP {step.id}</span>
                    <StepIcon size={11} className="text-slate-light" />
                  </div>
                  <h4 className="text-xs font-bold text-[#3A4048] dark:text-[#EFEDE6] leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate dark:text-slate-light">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
