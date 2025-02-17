import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Assessments from "../../services/assessments";
import { Status } from "../../utils/statusHandler";
import { message } from "antd";
import {
  Assessment,
  Strategy,
  ResultsSchema,
  Evaluation,
} from "../../types/assessments";
import workplaces from "../../services/workplace";
import supabase from "../../supabase.config";
import { PromiseAll } from "../../utils";

export const name = "assessments";

interface AssessmentState {
  fetchAllAssessmentStatus: Status;
  fetchSingleAssessmentStatus: Status;
  fetchEvaluationForSingleAssessmentsWorkplaceStatus: Status;
  fetchEvaluationForSingleAssessmentsWorkplaceForAvgResStatus: Status;
  allAssessments: Assessment[];
  singleAssessment: Assessment | null;
  evaluationForSingleAssessmentWorkplace: Evaluation[];
  evaluationForSingleAssessmentWorkplaceForAvgRes: Evaluation[];
  evaluationForSingleAssessmentWorkplaceForAvgResOldest: Evaluation[];
}

const initialState: AssessmentState = {
  fetchAllAssessmentStatus: Status.IDLE,
  fetchSingleAssessmentStatus: Status.IDLE,
  fetchEvaluationForSingleAssessmentsWorkplaceStatus: Status.IDLE,
  fetchEvaluationForSingleAssessmentsWorkplaceForAvgResStatus: Status.IDLE,
  allAssessments: [],
  singleAssessment: null,
  evaluationForSingleAssessmentWorkplace: [],
  evaluationForSingleAssessmentWorkplaceForAvgRes: [],
  evaluationForSingleAssessmentWorkplaceForAvgResOldest: [],
};

export const fetchAllAssessment = createAsyncThunk(
  `${name}/fetchAllAssessment`,
  async (_, { getState }: { getState: any }) => {
    const workplaceId = getState()?.workplace?.workplaceId;
    const workplace = await workplaces.getSingleWorkplace(workplaceId);
    const response = await Assessments.getAssessments();
    if (!response) {
      return message.error("Failed to fetch assessments");
    }
    return response?.map((item: any) => ({
      ...item,
      strategy: item.strategy as Strategy,
      results_schema: item.results_schema as ResultsSchema,
      // @ts-ignore
      active: (workplace?.enabled_assessments || [])?.includes(item?.id),
    }));
  }
);
export const fetchSingleAssessment = createAsyncThunk(
  `${name}/fetchSingleAssessment`,
  async (id: string, { getState }) => {
    // @ts-ignore
    const workplaceId = getState().workplace?.workplaceId;
    const response = await Assessments.getSingaleAssessment(id, workplaceId);
    if (!response) {
      return message.error("Failed to fetch assessments");
    }
    return response;
  }
);
export const fetchEvaluationForSingleAssessmentsWorkplace = createAsyncThunk(
  `${name}/fetchEvaluationForSingleAssessmentsWorkplace`,
  async ({
    workplaceId,
    assessmentId,
  }: {
    workplaceId: string;
    assessmentId: string;
  }) => {
    const response =
      await Assessments.getEvaluationForSingleAssessmentsWorkplaceAll(
        workplaceId,
        assessmentId
      );
    if (!response) {
      return message.error("Failed to fetch evaluations");
    }
    return response;
  }
);

// assessment dashboard
export const fetchEvaluationForSingleAssessmentsWorkplaceForAvgRes =
  createAsyncThunk(
    `${name}/fetchEvaluationForSingleAssessmentsWorkplaceForAvgRes`,
    async ({
      workplaceId,
      assessmentId,
    }: {
      workplaceId: string;
      assessmentId: string;
    }) => {
      const [newest, oldest] = await PromiseAll([
        Assessments.getEvaluationForSingleAssessmentsWorkplace(
          workplaceId,
          assessmentId,
          true
        ),
        Assessments.getEvaluationForSingleAssessmentsWorkplace(
          workplaceId,
          assessmentId,
          false
        ),
      ]);
      if (!newest || !oldest) {
        return message.error("Failed to fetch evaluations");
      }
      return { newest, oldest };
    }
  );

export const toggleAssessment = createAsyncThunk(
  `${name}/toggleAssessment`,
  async (
    {
      assessmentId,
      status,
    }: {
      assessmentId: string;
      status: boolean;
    },
    { getState, dispatch }
  ) => {
    // @ts-ignore
    const workplaceId = getState()?.workplace?.workplaceId;
    const { data: workplace, error: assessmentError } = await supabase
      .from("workplaces")
      .select("*")
      .eq("id", workplaceId)
      .single();
    if (assessmentError) throw assessmentError;

    if (status === true) {
      const updatedAssessments = [
        // @ts-ignore
        ...workplace?.enabled_assessments,
        assessmentId,
      ];
      const { error } = await supabase
        .from("workplaces")
        .update({ enabled_assessments: updatedAssessments })
        .eq("id", workplaceId);
      if (error) throw error;
      dispatch(
        updateAssessmentInList({ id: assessmentId, data: { active: true } })
      );
      message.success("Assessment enabled successfully!");
    }

    if (status === false) {
      // @ts-ignore
      const updatedAssessments = (workplace.enabled_assessments || []).filter(
        (a: string) => a !== assessmentId
      );
      const { error } = await supabase
        .from("workplaces")
        .update({ enabled_assessments: updatedAssessments })
        .eq("id", workplaceId);
      if (error) throw error;
      dispatch(
        updateAssessmentInList({ id: assessmentId, data: { active: false } })
      );
      message.success("Assessment disabled successfully!");
    }
  }
);

const assessmentsSlice = createSlice({
  name,
  initialState,
  reducers: {
    updateAssessmentInList(state, action) {
      const ix = state.allAssessments.findIndex(
        (item) => item.id === action.payload.id
      );
      state.allAssessments[ix] = {
        ...state.allAssessments[ix],
        ...action.payload.data,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAssessment.fulfilled, (state, action) => {
        state.allAssessments = (action.payload as Assessment[]) ?? [];
      })
      .addCase(fetchSingleAssessment.fulfilled, (state, action) => {
        state.singleAssessment = action.payload as never as Assessment;
      })
      .addCase(
        fetchEvaluationForSingleAssessmentsWorkplace.fulfilled,
        (state, action) => {
          state.evaluationForSingleAssessmentWorkplace =
            (action.payload as never as Evaluation[]) ?? [];
        }
      )
      .addCase(
        fetchEvaluationForSingleAssessmentsWorkplaceForAvgRes.fulfilled,
        (state, action) => {
          state.evaluationForSingleAssessmentWorkplaceForAvgRes =
            // @ts-ignore
            (action.payload?.newest as never as Evaluation[]) ?? [];
          state.evaluationForSingleAssessmentWorkplaceForAvgResOldest =
            // @ts-ignore
            (action.payload?.oldest as never as Evaluation[]) ?? [];
        }
      );
  },
});

export const { updateAssessmentInList } = assessmentsSlice.actions;
export default assessmentsSlice;
