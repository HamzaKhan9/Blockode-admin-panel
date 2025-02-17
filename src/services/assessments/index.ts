import supabase from "../../supabase.config";
import { message } from "antd";
import workplaces from "../workplace";

const getAssessments = async () => {
  try {
    let { data } = await supabase
      .from("assessments")
      .select("* , questions(question)");
    if (data) {
      return data;
    }
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};

const getSingaleAssessment = async (id: string, workplaceId: string) => {
  try {
    const workplace = await workplaces.getSingleWorkplace(workplaceId);
    let { data } = await supabase
      .from("assessments")
      .select("* , questions(id , question ,assessment_id, metadata))")
      .eq("id", id)
      .single();

    if (data) {
      // @ts-ignore
      return { ...data, active: workplace?.enabled_assessments?.includes(id) };
    }
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};

const getEvaluationForSingleAssessmentsWorkplaceAll = async (
  workplaceId: string,
  assessmentId: string
) => {
  try {
    let { data: evaluations } = await supabase
      .from("evaluations")
      .select(
        "id , user_id , assessment_id ,is_completed, results, user:profiles (id, email, name)"
      )
      .eq("workplace_id", workplaceId)
      .eq("assessment_id", assessmentId)
      .order("created_at", { ascending: false });

    if (evaluations) {
      return evaluations;
    }
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};
const getEvaluationForSingleAssessmentsWorkplace = async (
  workplaceId: string,
  assessmentId: string,
  latest: boolean
) => {
  try {
    // let { data: evaluations } = await supabase
    //   .from("evaluations")
    //   .select(
    //     "id , user_id , assessment_id ,is_completed, results, user:profiles (id, email, name)"
    //   )
    //   .eq("workplace_id", workplaceId)
    //   .eq("assessment_id", assessmentId)
    //   .order("created_at", { ascending: false });
    let { data: evaluations } = await supabase.rpc("get_evaluations", {
      assessment_id_param: assessmentId,
      workplace_id_param: workplaceId,
      latest,
    });
    if (evaluations) {
      return evaluations;
    }
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};

const Assesments = {
  getAssessments,
  getSingaleAssessment,
  getEvaluationForSingleAssessmentsWorkplace,
  getEvaluationForSingleAssessmentsWorkplaceAll,
};

export default Assesments;

// user_id(id , email , name , profile_photo)
