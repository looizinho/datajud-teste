import { handleProcesso } from "../lib/processo-handler.js";

export default async function handler(request, response) {
  return handleProcesso(request, response);
}
