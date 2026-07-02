import framework from "../../framework-library/soc2/framework.json";
import controlsData from "../../framework-library/soc2/controls.json";
import risksData from "../../framework-library/soc2/risks.json";
import testsData from "../../framework-library/soc2/tests.json";
import policiesData from "../../framework-library/soc2/policies.json";
import evidenceData from "../../framework-library/soc2/evidence.json";
import questionnaireData from "../../framework-library/soc2/questionnaire.json";
import tasksData from "../../framework-library/soc2/tasks.json";
import mappingsData from "../../framework-library/soc2/mappings.json";
import aiGuidanceData from "../../framework-library/soc2/ai-guidance.json";
import auditRulesData from "../../framework-library/soc2/audit-rules.json";

const frameworks = {
  "soc2-type-ii": {
    framework,
    controls: controlsData.controls,
    risks: risksData.risks,
    tests: testsData.tests,
    policies: policiesData.policies,
    evidence: evidenceData.evidenceRequirements,
    questionnaire: questionnaireData.questionnaireSections,
    tasks: tasksData.taskTemplates,
    mappings: mappingsData.mappings,
    aiGuidance: aiGuidanceData.aiGuidance,
    auditRules: auditRulesData.auditRules,
  },
};

export class FrameworkEngine {
  constructor(frameworkId = "soc2-type-ii") {
    this.frameworkId = frameworkId;
    this.library = frameworks[frameworkId];

    if (!this.library) {
      throw new Error(`Framework library not found: ${frameworkId}`);
    }
  }

  getFramework() {
    return this.library.framework;
  }

  getControls() {
    return this.library.controls;
  }

  getControlById(id) {
    return this.library.controls.find((control) => control.id === id) || null;
  }

  getRisks() {
    return this.library.risks;
  }

  getRiskById(id) {
    return this.library.risks.find((risk) => risk.id === id) || null;
  }

  getTests() {
    return this.library.tests;
  }

  getTestById(id) {
    return this.library.tests.find((test) => test.id === id) || null;
  }

  getPolicies() {
    return this.library.policies;
  }

  getPolicyById(id) {
    return this.library.policies.find((policy) => policy.id === id) || null;
  }

  getEvidence() {
    return this.library.evidence;
  }

  getEvidenceById(id) {
    return this.library.evidence.find((evidence) => evidence.id === id) || null;
  }

  getQuestionnaire() {
    return this.library.questionnaire;
  }

  getTasks() {
    return this.library.tasks;
  }

  getTaskById(id) {
    return this.library.tasks.find((task) => task.id === id) || null;
  }

  getMappings() {
    return this.library.mappings;
  }

  getMappingByControlId(controlId) {
    return this.library.mappings.find((mapping) => mapping.controlId === controlId) || null;
  }

  getAIGuidance() {
    return this.library.aiGuidance;
  }

  getAIGuidanceByControlId(controlId) {
    return this.library.aiGuidance.find((guidance) => guidance.controlId === controlId) || null;
  }

  getAuditRules() {
    return this.library.auditRules;
  }
}

export const frameworkEngine = new FrameworkEngine();

