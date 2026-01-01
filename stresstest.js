import http from "k6/http";

export const options = {
  STAGES: [
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  http.get("https://test.k6.io");
}
