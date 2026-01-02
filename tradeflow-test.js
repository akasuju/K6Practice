
import http from 'k6/http';
import { check, sleep } from 'k6';

// Env vars (set these from your shell to avoid hardcoding secrets)
const URL = __ENV.URL || 'https://testing-tradeflow.waterflowtechnology.net/floorsheet/dion-floorsheet?_rsc=1xkcx';

// Paste the cookies from your curl (or pass them via __ENV.COOKIES)
const COOKIES = __ENV.COOKIES || `__Host-next-auth.csrf-token=...; __Secure-next-auth.callback-url=...; __Secure-next-auth.session-token.0=...; __Secure-next-auth.session-token.1=...`;

// Headers from your curl; keep only the ones the server cares about.
// User-Agent and Accept are fine; Next-Router-State-Tree/RSC look app-specific.
const HEADERS = {
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive',              // optional
  'Referer': 'https://testing-tradeflow.waterflowtechnology.net/floorsheet/dion-floorsheet',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',

  // App-specific headers that might be required by Next.js/NextAuth/RSC:
  'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22floorsheet%22%2C%7B%22children%22%3A%5B%22dion-floorsheet%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Ffloorsheet%2Fdion-floorsheet%22%2C%22refetch%22%5D%7D%5D%7D%5D%7D%5D',
  'RSC': '1',

  // Sec- headers are browser hints; usually not required by servers—can be dropped if not needed:
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-GPC': '1',
  'sec-ch-ua': '"Brave";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

export const options = {
  vus: Number(__ENV.VUS || 10),
  iterations: Number(__ENV.ITERS || 20),
};

export default function () {
  const res = http.get(URL, {
    headers: {
      ...HEADERS,
      // Important: k6 does not have a -b flag like curl for cookies.
      // Send cookies via a Cookie header:
      'Cookie': COOKIES,
    },
  });

  check(res, {
    'status is 200/304': r => r.status === 200 || r.status === 304,
    'has body': r => (r.body || '').length > 0,
  });

  // Optional: log small snippet to verify
  // console.log(res.status, (res.body || '').substring(0, 160));

  sleep(1);
}
