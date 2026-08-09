import { getDataJudConfig } from "../lib/datajud.js";

export default function handler(_request, response) {
  const { url } = getDataJudConfig();
  response.status(200).json({ ok: true, endpoint: url });
}
