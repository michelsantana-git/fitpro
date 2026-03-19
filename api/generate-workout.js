export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { briefing, days } = req.body || {};
  if (!briefing || briefing.trim().length < 50) return res.status(400).json({ error: "Briefing muito curto" });

  const dayKeys = Array.isArray(days) && days.length >= 2 ? days : ["SEG","TER","QUI","SEX"];
  const dayNames = {SEG:"Segunda",TER:"Terça",QUA:"Quarta",QUI:"Quinta",SEX:"Sexta",SAB:"Sábado"};
  const dayList = dayKeys.map(d => dayNames[d]||d).join(", ");

  const prompt = `Você é um personal trainer especializado em hipertrofia. Com base no briefing abaixo, crie um plano de treino focado em hipertrofia para os seguintes dias: ${dayList}.

BRIEFING: ${briefing}

Responda APENAS com JSON válido sem markdown, sem texto adicional. Use exatamente estas chaves para os dias: ${dayKeys.join(",")}

{"${dayKeys[0]}":{"focus":"string","muscle_group":"string_sem_espacos","exercises":[{"id":"A1","name":"string","sets":"string","reps":"string","rest":"string","tip":"string"}]}${dayKeys.slice(1).map(d=>`,"${d}":{...}`).join("")}}

Regras:
- Sem barra livre, apenas halteres, máquinas e cabos
- 6 a 8 exercícios por dia
- Adapte completamente ao nível, objetivos e limitações físicas do briefing
- Distribua os grupos musculares de forma inteligente pelos dias disponíveis
- muscle_group deve ser string sem espaços (ex: peito_triceps, costas_biceps, quadriceps_ombros)`;

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
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: "Erro na API Claude", detail: err });
    }
    const data = await response.json();
    const text = data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
    const workout = JSON.parse(text);
    return res.status(200).json({ workout });
  } catch (e) {
    return res.status(500).json({ error: "Falha ao gerar treino", detail: e.message });
  }
}
