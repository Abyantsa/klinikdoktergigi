const http = require("http");

const BASE = "http://localhost:4000";

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = http.request(
      BASE + path,
      { method, headers },
      (res) => {
        let out = "";
        res.on("data", (c) => (out += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(out) });
          } catch {
            resolve({ status: res.statusCode, json: out });
          }
        });
      }
    );
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function main() {
  const results = [];
  const assert = (name, cond) => results.push((cond ? "PASS" : "FAIL") + " - " + name);

  const login = await req("POST", "/api/auth/login", {
    username: "admin",
    password: "admin123",
  });
  assert("login returns token", login.status === 200 && login.json.token);
  const token = login.json.token;

  const today = await todayStr();

  const b1 = await req("POST", "/api/bookings", {
    patientName: "Andi",
    phone: "08123456781",
    complaint: "demam",
    date: today,
    session: "MORNING",
  });
  assert("booking #1 queueNumber=1", b1.status === 201 && b1.json.booking.queueNumber === 1);
  const id1 = b1.json.booking.id;

  const b2 = await req("POST", "/api/bookings", {
    patientName: "Budi",
    phone: "08123456782",
    complaint: "batuk",
    date: today,
    session: "MORNING",
  });
  assert("booking #2 queueNumber=2", b2.status === 201 && b2.json.booking.queueNumber === 2);
  const id2 = b2.json.booking.id;

  const b3 = await req("POST", "/api/bookings", {
    patientName: "Cici",
    phone: "08123456783",
    complaint: "pusing",
    date: today,
    session: "MORNING",
  });
  assert("booking #3 queueNumber=3", b3.status === 201 && b3.json.booking.queueNumber === 3);
  const id3 = b3.json.booking.id;

  const call1 = await req("POST", "/api/queue/call-next", { date: today }, token);
  assert("call-next -> Andi EXAMINING", call1.json.patient.queueNumber === 1);

  const skip1 = await req("POST", "/api/queue/skip/" + id1, {}, token);
  assert("skip Andi -> SKIPPED", skip1.status === 200);

  const call2 = await req("POST", "/api/queue/call-next", { date: today }, token);
  assert("call-next -> Budi EXAMINING", call2.json.patient.queueNumber === 2);

  const complete2 = await req("POST", "/api/queue/complete/" + id2, {}, token);
  assert("complete Budi", complete2.status === 200);

  const recall1 = await req("POST", "/api/queue/recall/" + id1, {}, token);
  assert("recall Andi -> EXAMINING", recall1.status === 200);

  const call3blocked = await req("POST", "/api/queue/call-next", { date: today }, token);
  assert("call-next blocked while Andi EXAMINING", call3blocked.status === 409);

  const complete1 = await req("POST", "/api/queue/complete/" + id1, {}, token);
  assert("complete Andi", complete1.status === 200);

  const call3 = await req("POST", "/api/queue/call-next", { date: today }, token);
  assert("call-next -> Cici EXAMINING", call3.json.patient.queueNumber === 3);

  const report = await req("GET", "/api/queue/report?range=week", null, token);
  assert("report returns series", report.status === 200 && Array.isArray(report.json.series));

  const noToken = await req("POST", "/api/queue/call-next", { date: today });
  assert("call-next rejected without token", noToken.status === 401);

  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL"));
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
