import { faker } from "@faker-js/faker";
import moment, { Moment } from "moment";

export const randomDate = (
  start: Moment = moment().startOf("year"),
  end: Moment = moment()
) => {
  return faker.date
    .between({
      from: start.toISOString(),
      to: end.toISOString(),
    })
    .toISOString();
};
