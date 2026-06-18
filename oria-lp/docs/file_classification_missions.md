Missao 1 - Classifique os documentos de saude em: Paciente -> Categoria -> Datas.
1. Paciente: Extrair nome completo. Se ausente: "Indefinido".
2. Categoria: Analise o conteúdo e classifique estritamente — escolher apenas UMA:
   - TYPE_EXAM:  exclusivamente laudos laboratoriais de sangue, urina, fezes ou saliva.
   - TYPE_CONTEXT: receitas, pedidos de exame, atestados, anamnese, relatórios médicos, laudos de imagem (USG, RM, TC, PET, mamografia etc.) e quaisquer outros documentos clínicos que NÃO sejam TYPE_EXAM.
   - TYPE_JUNK: Documentos financeiros (Recibos, NFs), Administrativos ou Ilegíveis.
3. Data: Priorize data da coleta/atendimento. Se ausente, use emissão. Formato: DD/MM/AAAA (ou "Sem data").
Saida - Missao 1 - MODELO XML
<paciente>Nome ou Indefinido</paciente>
<categoria>VALOR_DA_CATEGORIA
   <data>DD/MM/AAAA</data>
</categoria>

Missao 2 - Se Arquivo = TYPE_CONTEXT -> Extrair resumo de dados relevantes de saude do documento, paciente (nome ou indefinido) e data (se existente).

Missao 3 - Se Arquivo = TYPE_CONTEXT -> Memoria Viva
Analise os dados extraidos pela missao 2 e proponha atualizacoes apenas para informacoes relevantes para saude. Quando existente, mencione data do fato relevante em "new_value" (importante ficar claro o significado da data [data laudo? data que foi informado?]).

REGRAS DE MAPEAMENTO (FIELD_PATH): Use estritamente os caminhos abaixo para o campo field_path:
- habits: .sono | .atividade_fisica | .alimentacao | .alcool | .tabaco.
- supplements: (retorne objeto com nome, dose, frequencia).
- medications_continuous: (retorne objeto com nome, dose, frequencia).
- conditions_declared: (fatos sobre diagnosticos, alergias ou historico familiar).
- emotional_health: .estresse | .ansiedade | .humor_recorrente.
- goals: (fatos sobre energia, longevidade, performance ou composicao corporal).
- communication_preferences: .tom | .formato | .horario_preferencial.
- other_relevant_information: (qualquer fato relevante que nao se encaixe nos acima).

Missao 4 - Para todo arquivo classificado como TYPE_CONTEXT onde o paciente foi extraido como Indefinido, gere uma pergunta de identificacao. Use emoji.
"Quem e o paciente deste arquivo?" [• 'Nome_Arquivo' | 'Dados_relevantes']

Saida - Missao 1 - MODELO XML
<paciente>Nome ou Indefinido</paciente>
<categoria>VALOR_DA_CATEGORIA (Apenas TYPE_CONTEXT, TYPE_EXAM ou JUNK)
   <data>DD/MM/AAAA</data>
</categoria>

Saida - Missao 2
• PACIENTE | Nome_Arquivo1: | Type: | Dados_relevantes: | DD/MM/AAAA:

Saida - Missao 3
[
  {
    "patient": "nome | indefinido",
    "field_path": "habits.sono",
    "new_value": "Dorme geralmente as 23h e acorda as 07h, com qualidade estavel | DD/MM/YYYY",
    "reason": "O usuario descreveu um padrao recorrente e estavel de horarios de sono.",
    "evidence_text": "Eu costumo ir para a cama as 11 da noite e acordo sempre as 7."
  }
]

Saida - Missao 4
<pergunta>
"Quem e o paciente do(s) arquivo(s) abaixo:"
- "Nome_Arquivo1" | "Dados_relevantes1"
- "Nome_Arquivo2" | "Dados_relevantes2"
</pergunta>