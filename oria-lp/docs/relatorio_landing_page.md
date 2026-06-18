# Relatório — Landing Page ORIA

> Documento de arquitetura em linguagem natural para leitura por qualquer pessoa.

---

## O que é a ORIA?

A **ORIA** é um serviço de saúde inteligente. A proposta central é simples: o usuário envia seus exames médicos pelo **WhatsApp** (em PDF ou foto) e recebe de volta um relatório claro, organizado e compreensível sobre a sua saúde — sem precisar instalar nenhum aplicativo.

---

## O que a página contém

A landing page é construída em **Next.js** (tecnologia web moderna) e se divide nas seguintes seções, de cima para baixo:

### 1. Barra de navegação (topo fixo)
- Fica sempre visível enquanto o usuário rola a página.
- Contém o **logo da ORIA**, links para as principais seções e um botão de ação para iniciar o envio de exame.
- Possui um botão de alternar entre **modo escuro e modo claro**.

### 2. Tela principal (Hero)
- Apresenta o slogan principal: **"Seus exames finalmente fazem sentido."**
- Explica em uma frase o que a ORIA faz.
- Oferece dois botões: um para **enviar exame pelo WhatsApp** e outro para ver como funciona.
- Mostra três selos de confiança: dados protegidos, resposta em segundos, complementa o médico.
- Exibe uma **simulação visual de celular** com um relatório ORIA de exemplo — inclusive com gráfico de histórico animado.

### 3. Filme da marca (FilmSection)
- Uma animação cinematográfica de ~30 segundos que conta a história da ORIA visualmente.
- Divide-se em cenas: boas-vindas, o problema dos exames soltos, o envio pelo WhatsApp, o processamento pela IA e o recebimento do relatório.
- Ocupa a tela inteira e rola suavemente para o centro quando o usuário se aproxima dela.

### 4. O Problema (seção "O que é")
- Explica por que os exames tradicionais são difíceis de usar com 4 cartões:
  - **Exames espalhados** — PDFs e fotos soltos, difíceis de reunir.
  - **Difíceis de entender** — Números técnicos sem contexto.
  - **Sem histórico** — Impossível ver a evolução ao longo do tempo.
  - **Sem visão integrada** — Dados existem, mas não viram uma narrativa de saúde.

### 5. A Solução
- Apresenta a ORIA como resposta direta aos problemas acima.
- Resume em 4 pontos o que ela faz: organiza, explica, cria histórico e mostra evolução.
- Destaca o conceito de **"Personal Health Intelligence"**.

### 6. Como Funciona (seção "Como funciona")
- Mostra o processo em **3 passos animados**:
  1. **Você envia** — manda o PDF ou foto pelo WhatsApp, sem app, sem cadastro.
  2. **A ORIA processa** — organiza, extrai e interpreta cada marcador com contexto.
  3. **Você recebe** — resumo claro, relatório visual e histórico em segundos.
- Cada passo tem uma ilustração interativa que anima conforme o usuário lê.

### 7. O que você recebe (seção "Benefícios")
- Detalha os 4 entregáveis do serviço:
  - **Resumo simples** em linguagem clara (sem termos médicos complicados).
  - **Relatório visual** com organização dos marcadores.
  - **Histórico cronológico** de todos os exames enviados.
  - **Comparação ao longo do tempo** para acompanhar a evolução da saúde.
- Termina com a frase: *"Não é só um exame. É a história da sua saúde."*

### 8. Diferenciais — O que a ORIA é (e não é)
- Dois painéis lado a lado:
  - **A ORIA é:** inteligência que organiza exames, contexto para decisões, visão longitudinal da saúde, complemento ao cuidado médico.
  - **A ORIA não é:** aplicativo complexo, laboratório, sistema de diagnóstico automático, substituto do médico.

### 9. Chamada Final para Ação (FinalCTA)
- Um painel escuro destacado com a frase **"Comece agora."**
- Botão direto para enviar o primeiro exame pelo WhatsApp.

### 10. Rodapé
- Links de navegação para todas as seções.
- Links institucionais: Privacidade, Termos, Aviso Médico.
- **Aviso importante** em destaque: *"A ORIA não fornece diagnóstico médico. Os relatórios têm caráter informativo e não substituem a consulta com profissionais de saúde."*

---

## Elementos interativos presentes na página

- **Simulador de chat WhatsApp** — um modal que abre quando o usuário clica em qualquer botão de ação. O usuário pode simular o envio de um exame e ver como a ORIA responderia, com animação de "digitando..." e mensagem de retorno.
- **Botão flutuante do WhatsApp** — fica fixo no canto inferior direito da tela durante toda a navegação.
- **Animações de entrada (scroll)** — cada seção e cartão aparece suavemente conforme o usuário desce a página.
- **Gráficos animados** — as barras de histórico crescem ao ficarem visíveis, simulando evolução real de marcadores.
- **Tema claro/escuro** — o usuário pode alternar a qualquer momento.

---

## Resumo técnico simplificado

| Camada | Tecnologia |
|---|---|
| Framework web | Next.js 14 (React) |
| Linguagem | TypeScript |
| Estilo | CSS com tokens de design (variáveis customizadas) |
| Animações | Biblioteca própria baseada em `requestAnimationFrame` |
| Deploy | Aplicação web estática/SSR |

---

*Relatório gerado em 12/06/2026.*
