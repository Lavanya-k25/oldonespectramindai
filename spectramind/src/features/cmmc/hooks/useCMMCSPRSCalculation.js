import { useMemo } from "react";
import {
  CMMC_FRAMEWORK_ID,
  getFrameworkLibrary,
} from "../../../core/engines/framework-engine/frameworkRegistry";
import { calculateCMMCSPRSMetrics } from "../services/cmmcSPRSCalculationService";
import { useCMMCWorkflowState } from "./useCMMCWorkflowState";

const cmmcLibrary = getFrameworkLibrary(CMMC_FRAMEWORK_ID) || emptyFrameworkLibrary();

export function useCMMCSPRSCalculation(frameworkLibrary = cmmcLibrary) {
  const { workflowState } = useCMMCWorkflowState();

  return useMemo(
    () => calculateCMMCSPRSMetrics(workflowState, frameworkLibrary),
    [frameworkLibrary, workflowState]
  );
}

function emptyFrameworkLibrary() {
  return {
    controls: [],
    evidence: [],
    mappings: [],
  };
}
