import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const analyze = () => {
    const q = question.toLowerCase();

    if (q.includes("soc2") || q.includes("score")) {
      setResponse(
        "Your SOC 2 readiness is 81%. 12 controls are incomplete, Incident Response Testing is missing, and 3 vendor reviews are overdue."
      );
    } else if (q.includes("risk")) {
      setResponse(
        "There are currently 3 open risks. The highest priority risk is an unpatched server."
      );
    } else if (q.includes("vendor")) {
      setResponse(
        "AWS is low risk. GitHub and Google Workspace require review within the next quarter."
      );
    } else if (q.includes("evidence")) {
      setResponse(
        "124 evidence files have been uploaded. The Access Review and IAM Audit evidence are mapped to SOC 2 controls."
      );
    } else {
      setResponse(
        "I could not find a matching compliance insight. Try asking about SOC 2, risks, vendors, or evidence."
      );
    }
  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold text-black dark:text-white">
            AI Compliance Assistant
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            Ask questions about your compliance program.
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 mt-8">

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Why is my SOC 2 score low?"
              className="
                w-full
                h-40
                border
                border-gray-300
                dark:border-slate-700
                rounded-xl
                p-4
                bg-white
                dark:bg-slate-700
                text-black
                dark:text-white
              "
            />

            <button
              onClick={analyze}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Analyze
            </button>

          </div>

          {response && (

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 mt-6">

              <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
                Analysis
              </h2>

              <p className="text-gray-700 dark:text-gray-300">
                {response}
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}