import { Lock, Mail, ShieldCheck } from "lucide-react";
import AppShell from "../components/layout/AppShell";

const trustItems = [
  ["Compliance Status", "SOC 2 In Progress", ShieldCheck],
  ["Security Contact", "security@spectramind.ai", Mail],
  ["Evidence Access", "Gated by approval", Lock],
];

export default function TrustCenter() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Trust
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
            Trust Center
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Prepare customer-facing security posture, compliance status, and access controls.
          </p>
        </div>

        <section className="rounded-2xl bg-slate-950 p-8 text-white dark:bg-blue-600">
          <h2 className="text-3xl font-bold">Customer trust profile</h2>
          <p className="mt-3 max-w-2xl text-slate-300 dark:text-blue-100">
            Share the right security posture with prospects and customers while keeping sensitive evidence gated.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {trustItems.map(([title, value, Icon]) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <Icon size={24} />
              </div>
              <h2 className="mt-6 text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{value}</p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
