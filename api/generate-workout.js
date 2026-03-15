export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { briefing } = req.body;

  if (!briefing || briefing.trim().length < 50) {
    return res.status(400).json({ error: "Briefing muito curto" });
  }

  const prompt = `Você é um personal trainer especializado em hipertrofia. Com base no briefing abaixo, crie um plano de 4 dias (SEG, TER, QUI, SEX) focado em hipertrofia.

BRIEFING: ${briefing}

Responda APENAS com JSON válido sem markdown:
{"SEG":{"focus":"string","muscle_group":"string_sem_espacos","exercises":[{"id":"A1","name":"string","sets":"string","reps":"string","rest":"string","tip":"string"}]},"TER":{...},"QUI":{...},"SEX":{...}}

Regras: sem barra livre, apenas halteres/máquinas/cabos, 6-8 exercícios por dia, adapte ao nível e limitações do briefing.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: "Erro na API Claude", detail: err });
    }

    const data = await response.json();
    const text = data.content.map((i) => i.text || "").join("").replace(/```json|```/g, "").trim();
    const workout = JSON.parse(text);

    return res.status(200).json({ workout });
  } catch (e) {
    return res.status(500).json({ error: "Falha ao gerar treino", detail: e.message });
  }
}
