import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 10,
  iterations: 20,
};
const params = {
  headers: {
    Authorization:
      "B74166781ad77dd1942d205f2a8ccfcd029a5ccfafa8bc474c896b15165d42f95",
  },
};
let headers_api = {
  Authorization: "Bearer 535534",
};

const url = "https://gorest.co.in/public/v2/users/";

export default function () {
  const response = http.get(url, params);
  check(response, {
    "status code validation": (response) => response.status === 200,
  });
}

// import { check } from "k6";
// import http from "k6/http";

// export const options = {
//   vus: 10,
//   iterations: 20,
// };

// export default function () {
//  const response= http.get("https://test.k6.io");
//   check(response, {
//     "status is 200": (response) => response.status === 200,
//   });
// }
