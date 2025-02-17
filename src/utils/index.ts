import promiseRetry from "promise-retry";
import { getErrorMessage } from "./errorHandler";
import moment from "moment";
import Papa from "papaparse";
import {
  GameResponseTypes,
  GroupedData,
  gameLevelSuccessStatsForGraph,
} from "../types/common";
export function getRoutePath(basePath: string, currPath: string): string {
  if (currPath.startsWith("/")) return currPath;
  return basePath + "/" + currPath;
}

export const delay = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const capitalize = (str: string): string =>
  str
    .split(" ")
    .map((substr: string) => substr[0].toUpperCase() + substr.slice(1))
    .join(" ");

export async function dispatch(action: any) {
  const { store } = await import("../store");
  return store.dispatch(action);
}

export const pickByKeys = (obj: any, keys: string[] = []) => {
  const newOBj: any = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (keys.includes(key)) newOBj[key] = val;
  });
  return newOBj;
};

export const placeholderImg =
  "data:image/png;base64,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";

export function arrayExtend(arr: any, count: number) {
  if (count <= arr.length) return [...arr];
  return [...arr, ...Array(count - arr.length).fill({})];
}

export async function urlToBlobOrFile(url: string) {
  try {
    const response = await fetch(url);
    const fileName = url.substring(url.lastIndexOf("/") + 1);
    const blob = await response.blob();
    let file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (error) {
    console.error("Error converting URL to Blob/File:", error);
    return null;
  }
}

export const getUserLocalStorage = () => {
  if (localStorage.getItem("curr_username")) {
    const user = JSON.parse(localStorage.getItem("curr_username") || "");
    return user;
  }
};

export const uniqueArrayByKey = (arr: any[], key: string) => {
  let unique: any = {};
  arr.forEach((item) => {
    if (!unique[item[key]]) {
      unique[item[key]] = item;
    }
  });
  return Object.values(unique);
};

export const getAvgDuration = (allGamesInfo: any) => {
  let totalGameDuration = 0;
  let totalLength = 0;
  if (allGamesInfo.length > 0) {
    uniqueArrayByKey(allGamesInfo, "game_id").forEach((game: any) => {
      for (let i = 0; i < game.durations?.length; i++) {
        if (!game.levels_completed[i]) continue;
        totalLength++;
        totalGameDuration += game?.durations[i];
      }
    });
    return totalGameDuration / totalLength;
  }
  return 0;
};

export const getTotalScore = (allGamesInfo: any) => {
  let totalScore = 0;
  if (allGamesInfo.length > 0) {
    uniqueArrayByKey(allGamesInfo, "game_id").forEach((allGame: any) => {
      totalScore += allGame?.levels_completed.filter(
        (completed: boolean) => completed
      ).length;
    });
  }
  return totalScore;
};

export const stringToNumberInRange = (
  text: string,
  min: number,
  max: number
) => {
  // Calculate a hash value from the input string
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash += text.charCodeAt(i);
  }

  // Map the hash value to the desired range
  const range = max - min + 1;
  const mappedValue = ((hash % range) + range) % range;

  // Add the minimum value to get the final result within the range
  const result = min + mappedValue;

  return result;
};

export function humanizedDuration(durationInMilliseconds: number) {
  if (isNaN(durationInMilliseconds)) {
    return "--";
  }

  const durationInSeconds = durationInMilliseconds / 1000;

  if (durationInSeconds < 60) {
    return `${Math.round(durationInSeconds)} second${
      durationInSeconds < 2 ? "" : "s"
    }`;
  } else if (durationInSeconds < 3600) {
    const minutes = +(durationInSeconds / 60).toPrecision(2);
    return `${minutes} Minute${minutes === 1 ? "" : "s"}`;
  } else {
    const hours = +(durationInSeconds / 3600).toPrecision(2);
    return `${hours} Hour${hours === 1 ? "" : "s"}`;
  }
}

export async function PromiseAll(promises: Promise<any>[], batchSize = 20) {
  if (!batchSize || !Number.isInteger(batchSize) || batchSize <= 0)
    return Promise.all(promises);

  let position = 0;
  let results: any[] = [];
  while (position < promises.length) {
    const batch = promises.slice(position, position + batchSize);
    results = [...results, ...(await Promise.all(batch))];
    position += batchSize;
  }
  return results;
}

export const promiseWithRetry = (
  promise: Promise<any>,
  options?: Parameters<typeof promiseRetry>[0]
) => {
  return promiseRetry(
    (retry, attempt) =>
      promise.catch((e) => {
        console.log("Error: ", getErrorMessage(e));
        console.log("Retry attempt: ", attempt);
        retry(e);
      }),
    {
      retries: 3,
      ...(options || {}),
    }
  );
};

export const convertToCsv2 = (
  rows: Record<string, any>[],
  header: (string | undefined)[]
): string => {
  const validHeaders = header.filter(
    (h) => h !== undefined && h in rows[0]
  ) as string[];
  const headerRow = validHeaders.join(",");
  const remainingRows = rows
    .map((row) => validHeaders.map((colName) => row[colName]).join(","))
    .join("\n");
  return `${headerRow}\n${remainingRows}`;
};

export const convertToCsv = (rows: Record<string, any>[], header: string[]) => {
  return Papa.unparse({ fields: header.filter((item) => !!item), data: rows });
};

export const downloadCsv = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function countPercentage(value: any) {
  if (value?.previous_count_result === 0) return 0;
  const percent =
    ((value?.current_count_result - value?.previous_count_result) /
      value?.previous_count_result) *
    100;
  return Math.round(Number(percent?.toFixed(2)));
}

export function getTimeDifference(previousTimeStamp: number) {
  const currentTime = new Date();
  const differenceInMilliseconds = currentTime.getTime() - previousTimeStamp;
  const minutes = differenceInMilliseconds / (1000 * 60);

  return Number(Math.trunc(minutes));
}

export function getDateRange(value: any) {
  const lastDayOfLastMonth = moment()
    .clone()
    .startOf(value)
    .clone()
    .subtract(1, "day");

  const firstDayOfLastMonth = lastDayOfLastMonth.clone().startOf(value);
  const previousStartDate = firstDayOfLastMonth.format("YYYY-MM-DD");
  const previousEndDate = lastDayOfLastMonth.format("YYYY-MM-DD");
  const startDate = moment().startOf(value).format("YYYY-MM-DD");
  const endDate = moment().endOf(value).format("YYYY-MM-DD");

  return { startDate, endDate, previousStartDate, previousEndDate };
}

export const getDurationRepectedLevel = (data: any) => {
  if (data?.length === 0) return `0 Seconds`;
  let totalSum = 0;
  let totalCount = 0;

  data.forEach((obj: any) => {
    totalSum += obj.durations.reduce(
      (acc: any, duration: number) => acc + duration,
      0
    );
    totalCount += obj.durations.length;
  });
  const duration = humanizedDuration(totalSum / totalCount);

  return duration;
};

export const getSuccesGamesLevels = (data: any) => {
  if (data?.length === 0) return 0;
  let totalLevels = 0;
  let trueLevels = 0;

  data.forEach((obj: any) => {
    totalLevels += obj.levels_completed.length;
    trueLevels += obj.levels_completed.filter(
      (level: any) => level === true
    ).length;
  });

  const percentage = (trueLevels / totalLevels) * 100;
  return `${percentage?.toFixed(2)} %`;
};
export const unAttemptedGames = (data: any) => {
  if (data?.length === 0) return 0;

  let totalLevels = 0;
  let unAtttmpLevel = 0;

  data.forEach((obj: any) => {
    totalLevels += obj.durations?.length;
    unAtttmpLevel += obj.durations?.filter((dur: any) => dur === 0).length;
  });

  const percentage = (unAtttmpLevel / totalLevels) * 100;
  return `${percentage?.toFixed(2)} %`;
};

export const gameStatistcsTableDashboard = (usersGameInfo: any) => {
  const groupedData: any = {};

  usersGameInfo.forEach((obj: any) => {
    const { game_id, durations, levels_completed } = obj;
    if (!groupedData[game_id]) {
      groupedData[game_id] = {
        durations: [],
        levels_completed: [],
      };
    }
    groupedData[game_id].durations.push(...durations);
    groupedData[game_id].levels_completed.push(...levels_completed);
  });

  const gameData: any = [];

  for (const game_id in groupedData) {
    const durations = groupedData[game_id].durations;
    const sumDuration = durations.reduce(
      (acc: any, curr: any) => acc + curr,
      0
    );
    const average = humanizedDuration(sumDuration / durations.length);

    const levels_completed = groupedData[game_id].levels_completed;
    const sumlevelCompleted = levels_completed.reduce(
      (acc: any, curr: any) => acc + (curr ? 1 : 0),
      0
    );

    const averageSuccess = (
      (sumlevelCompleted / levels_completed?.length) *
      100
    )?.toFixed(2);

    gameData.push({
      game: capitalize(game_id),
      duration: average || `{0} Seconds`,
      success: levels_completed?.length === 0 ? 0 : averageSuccess,
    });
  }

  return gameData || [];
};

export const getAverageGameLevelsStats = (
  usersGameInfo: GameResponseTypes[]
) => {
  const groupedData: GroupedData = {};
  usersGameInfo?.length > 0 &&
    usersGameInfo?.forEach((obj) => {
      const { game_id, levels_completed } = obj;
      const gameName = game_id;

      if (!groupedData[game_id]) {
        groupedData[game_id] = { gameName, levels: [] };
        levels_completed?.length > 0 &&
          levels_completed.forEach((_, index) => {
            const gameUsers = usersGameInfo?.filter(
              (user) => user.game_id === game_id
            );
            const levelData = gameUsers?.map(
              (user) => user.levels_completed[index]
            );
            const successCount = levelData.filter((value) => value)?.length;
            const successRate = Number(
              ((successCount / gameUsers.length) * 100)?.toFixed(2)
            );
            groupedData[game_id].levels?.push({
              level: `Level ${index + 1}`,

              successRate: successRate,
            });
          });
      }
    });

  const transformedData: gameLevelSuccessStatsForGraph[] = [];
  for (let i = 0; i < 10; i++) {
    const levelObj: { name: string; [gameName: string]: any } = {
      name: `Level ${i + 1}`,
    };
    for (const gameKey in groupedData) {
      if (groupedData.hasOwnProperty(gameKey)) {
        const game = groupedData[gameKey];
        const successRate = game.levels[i]
          ? Number(game.levels[i].successRate)
          : 0.0;
        levelObj[capitalize(game.gameName)] = successRate;
      }
    }
    transformedData.push(levelObj);
  }

  return transformedData;
};

export function detectOS() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];
  let os = null;

  if (macosPlatforms.includes(platform)) {
    os = "Mac OS";
  } else if (iosPlatforms.includes(platform)) {
    os = "iOS";
  } else if (windowsPlatforms.includes(platform)) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (/Linux/.test(platform)) {
    os = "Linux";
  } else if (/CrOS/.test(userAgent)) {
    os = "Chrome OS";
  }

  return os;
}

export const getWorkplaceId = (data: any) =>
  data?.employment_status === "Employed Adult 18+"
    ? data?.workplace_ref?.id
    : data?.institution_ref?.id;

export const getWorkplaceName = (data: any) =>
  data?.employment_status === "Employed Adult 18+"
    ? data?.workplace_ref?.workplace_name
    : data?.institution_ref?.workplace_name;

export function generateColors(length: number) {
  const colors: string[] = [];
  for (let i = 0; i < length; i++) {
    let color = "#";
    for (var j = 0; j < 6; j++) {
      color += "0123456789ABCDEF"[Math.floor(Math.random() * 16)];
    }
    colors.push(color);
  }
  return colors;
}

export function removeDuplicates(array: any[], key: any) {
  const seen = new Set();
  return array.filter((item: any) => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    } else {
      seen.add(keyValue);
      return true;
    }
  });
}
