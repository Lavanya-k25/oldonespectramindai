import { useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const initialEvidence = [
  {
    name: "Access Review.pdf",
    category: "Access Control",
    uploaded: "Jun 2026"
  },
  {
    name: "IAM Audit.xlsx",
    category: "Identity Management",
    uploaded: "Jun 2026"
  },
  {
    name: "Incident Response Plan.pdf",
    category: "Security Operations",
    uploaded: "May 2026"
  }
];

export default function Evidence() {

  const [files, setFiles] = useState(initialEvidence);

  const handleUpload = (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const newFile = {
      name: file.name,
      category: "Uploaded File",
      uploaded: "Today"
    };

    setFiles([
      ...files,
      newFile
    ]);
  };

  const deleteFile = (fileName) => {

    setFiles(
      files.filter(
        (file) => file.name !== fileName
      )
    );

  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
            Evidence Repository
          </h1>

          {/* Upload Area */}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-8 mb-8">

            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-12 text-center">

              <h2 className="text-2xl font-bold text-black dark:text-white">
                📄 Drag & Drop Files Here
              </h2>

              <p className="text-gray-500 dark:text-gray-300 mt-3">
                Upload compliance evidence and supporting documents.
              </p>

              <label className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-blue-700">

                Upload Evidence

                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                />

              </label>

            </div>

          </div>

          {/* Evidence List */}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">

            <div className="p-6 border-b border-gray-200 dark:border-slate-700">

              <h2 className="text-2xl font-bold text-black dark:text-white">
                Uploaded Files
              </h2>

            </div>

            {files.map((file) => (

              <div
                key={file.name}
                className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-bold text-lg text-black dark:text-white">
                    📄 {file.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-300">
                    {file.category}
                  </p>

                </div>

                <div className="flex items-center gap-6">

                  <span className="text-gray-500 dark:text-gray-300">
                    {file.uploaded}
                  </span>

                  <button
                    onClick={() => deleteFile(file.name)}
                    className="text-red-600 font-semibold hover:text-red-800"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}