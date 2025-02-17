export const opennessLevels = {
  "0-20":
    "You require routine and structure, struggling with innovation and rapid change.",
  "21-40":
    "You perform well in environments that balance stability with occasional changes.",
  "41-60":
    "You are capable of adapting to new situations and changes, contributing to innovation but also value proven methods.",
  "61-80":
    "You thrive in environments that are dynamic and creative, being a driver of innovation.",
  "81-100":
    "You seek out new experiences desiring to be pioneers in your field, albeit you struggle with routine tasks.",
};

export const extraversionLevels = {
  "0-20": "You are reserved, preferring to listen rather than speak.",
  "21-40":
    "You are comfortable with routine interactions, working well in teams out of the spotlight.",
  "41-60":
    "You are versatile, contributing well in teams and in solitary roles.",
  "61-80":
    "You are a leader and motivator, able to engage and inspire colleagues in fast-paced, dynamic environments.",
  "81-100":
    "You are persuasive as the life of the office, preferring social settings rather than tasks requiring long periods of solitude.",
};

export const agreeablenessLevels = {
  "0-20":
    "You challenge others and are less concerned about pleasing people, good at tough decision-making or negotiations.",
  "21-40":
    "You are a team player, who does not shy away from conflict if it means achieving the best outcome.",
  "41-60":
    "You work well in most teams, capable of putting forward their own ideas and preferences when necessary.",
  "61-80":
    "You often go out of your way to help others and avoid conflicts, fostering team morale and a collaborative environment.",
  "81-100":
    "You are the peacemaker, always ready to assist. You struggle with confrontation.",
};

export const conscientiousnessLevels = {
  "0-20":
    "You thrive in creativity and flexibility, often struggling with organization, preferring spontaneous over planned actions.",
  "21-40":
    "You are somewhat organized but might lack consistency in long-term planning or when too many details are involved.",
  "41-60":
    "You are versatile, able to manage regular tasks efficiently and can adapt to varying degrees of structure and spontaneity in your work.",
  "61-80":
    "You are reliable, organized, and efficient with a meticulous attention to detail, albeit you may struggle with creativity and change.",
  "81-100":
    "You are precise, often spending excessive time on details. You struggle with quick decision-making and flexibility.",
};

export const neuroticismLevels = {
  "0-20":
    "You are often perceived as reliable under pressure, maintaining a composed and steady demeanor in challenging situations.",
  "21-40": "You are capable of handling stress, recovering well from setbacks.",
  "41-60":
    "You manage day-to-day stress well but might struggle with high-stress situations.",
  "61-80":
    "You react more visibly to stress and might need more support to manage work-related pressures effectively.",
  "81-100":
    "You frequently feel overwhelmed or stressed by everyday work challenges, which can significantly affect your performance and interactions with colleagues.",
};

export function getAssessmentLevelDescription(percentage: number, levels: any) {
  if (percentage >= 0 && percentage <= 20) {
    return levels["0-20"];
  } else if (percentage >= 21 && percentage <= 40) {
    return levels["21-40"];
  } else if (percentage >= 41 && percentage <= 60) {
    return levels["41-60"];
  } else if (percentage >= 61 && percentage <= 80) {
    return levels["61-80"];
  } else if (percentage >= 81 && percentage <= 100) {
    return levels["81-100"];
  } else {
    return "Invalid percentage";
  }
}
