import { useEffect, useState } from "react";
import {
  CMMCPageLayout,
  CMMCProgressRing,
  CMMCSectionCard,
} from "../components";
import { overviewMetrics } from "../data";

const RING_SIZE = 112;
const RING_STROKE = 10;
const RING_DURATION_MS = 1100;
const CARD_STAGGER_MS = 70;
const RING_TRACK_COLOR = "#ece7dc";
const RING_TEXT_COLOR = "#25221d";

export default function CMMCOverviewPage() {
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setCardsVisible(true));

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <CMMCPageLayout
      eyebrow="CMMC Workspace"
      title="Overview Dashboard"
      description="Top-level CMMC workspace summary."
    >
      <CMMCSectionCard
        title="Overview"
        description="Implementation progress across core CMMC readiness workstreams."
        className="p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {overviewMetrics.map((metric, index) => (
            <article
              key={metric.id}
              className={`flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-[#fffdf8]/72 p-4 text-center transition-all duration-500 ease-out ${
                cardsVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: `${index * CARD_STAGGER_MS}ms` }}
            >
              <p className="mb-2 text-xs font-black text-slate-600">
                {metric.title}
              </p>
              <CMMCProgressRing
                value={metric.value}
                size={RING_SIZE}
                stroke={RING_STROKE}
                progressColor={metric.color}
                trackColor={RING_TRACK_COLOR}
                textColor={RING_TEXT_COLOR}
                duration={RING_DURATION_MS}
                label={`${metric.title}: ${metric.value}%`}
              />
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {metric.subtitle}
              </p>
            </article>
          ))}
        </div>
      </CMMCSectionCard>
    </CMMCPageLayout>
  );
}
