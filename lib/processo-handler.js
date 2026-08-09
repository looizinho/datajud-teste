import { findProcessos } from "./datajud.js";

export async function handleProcesso(request, response, numero) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método não permitido" });
  }

  try {
    const result = await findProcessos(numero, process.env);
    if (result.error) return response.status(result.status).json({ error: result.error });
    return response.status(result.status).json(result.body);
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
