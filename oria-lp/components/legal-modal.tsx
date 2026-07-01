"use client";

/* ─────────────────────────────────────────────────────────────
   ORIA — Legal modals (Privacidade, Termos, Aviso médico)
   Premium, scrollable dialogs opened from the footer. Content is
   modelled as structured blocks so each document renders with the
   same numbered-section, highlight-callout and list treatment.
   ───────────────────────────────────────────────────────────── */

import React, { useEffect, useRef } from "react";
import { Icon } from "./parts";

/* ── Content model ─────────────────────────────────────────────── */
type Block =
  | { type: "p"; text: string }
  | { type: "highlight"; icon: string; text: string }
  | { type: "list"; items: { label: string; text: string }[] };

interface Section {
  heading: string;
  blocks: Block[];
}

export interface LegalDoc {
  icon: string;
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: Section[];
  footnote?: string;
}

export type LegalDocKey = "privacy" | "terms" | "medical";

/* ── Documents ─────────────────────────────────────────────────── */
export const LEGAL_DOCS: Record<LegalDocKey, LegalDoc> = {
  privacy: {
    icon: "shield-check",
    eyebrow: "Privacidade & LGPD",
    title: "Política de Privacidade",
    updated: "Última atualização: junho de 2026",
    intro:
      "No Oria, entendemos que seus exames e seu histórico médico são as informações mais confidenciais que você possui. Esta política explica, de forma transparente, como coletamos, usamos, armazenamos e protegemos seus dados pessoais e de saúde — em total conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
    sections: [
      {
        heading: "Quais dados coletamos",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Dados de cadastro",
                text: "Nome completo, e-mail, CPF, data de nascimento e senha — necessários para criar e validar a sua conta.",
              },
              {
                label: "Dados sensíveis de saúde",
                text: "Resultados de exames laboratoriais, laudos, marcadores bioquímicos e históricos contidos exclusivamente nos arquivos (PDFs ou imagens) que você escolhe enviar ativamente à plataforma.",
              },
              {
                label: "Dados de navegação e dispositivo",
                text: "Endereço IP, tipo de navegador, logs de acesso e cookies essenciais para o funcionamento seguro do hub.",
              },
            ],
          },
        ],
      },
      {
        heading: "Para que utilizamos seus dados",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Processamento de relatórios",
                text: "Usamos os dados dos exames enviados para, através da nossa Inteligência Artificial, extrair informações, organizar marcadores e gerar o seu relatório visual e explicativo.",
              },
              {
                label: "Acompanhamento longitudinal",
                text: "Seus dados são armazenados de forma contínua para que você visualize a evolução do seu histórico de saúde ao longo do tempo.",
              },
              {
                label: "Melhoria do sistema",
                text: "Dados extraídos podem ser utilizados de forma estritamente anonimizada — sem qualquer ligação com o seu nome, CPF ou identidade — para calibração e melhoria dos nossos algoritmos.",
              },
            ],
          },
        ],
      },
      {
        heading: "Consentimento e base legal",
        blocks: [
          {
            type: "p",
            text: "Por lidarmos com dados de saúde (dados sensíveis), o processamento pelo Oria ocorre exclusivamente mediante o seu consentimento explícito e inequívoco. Ao fazer o upload de um exame, você autoriza ativamente a equipe e os sistemas do Oria a processarem aquele arquivo para a geração do seu relatório.",
          },
        ],
      },
      {
        heading: "Com quem compartilhamos seus dados",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Equipe interna",
                text: "O processamento ocorre inteiramente pela equipe e pelos sistemas do próprio Oria, sob rigorosos acordos de confidencialidade.",
              },
              {
                label: "Infraestrutura de nuvem",
                text: "Compartilhamos dados estritamente com nossos provedores de hospedagem (ex.: AWS, Google Cloud), que possuem os mais altos certificados de segurança globais e atuam apenas como operadores dos dados.",
              },
            ],
          },
          {
            type: "highlight",
            icon: "lock",
            text: "O Oria NÃO vende, não aluga e não compartilha seus dados de saúde com planos de saúde, seguradoras, empregadores ou indústrias farmacêuticas sob nenhuma circunstância.",
          },
        ],
      },
      {
        heading: "Armazenamento e segurança da informação",
        blocks: [
          {
            type: "p",
            text: "Protegemos a plataforma com camadas múltiplas de segurança e acesso à sua conta protegido por senha pessoal.",
          },
          {
            type: "highlight",
            icon: "shield-check",
            text: "Todos os dados são criptografados — tanto em trânsito quanto em repouso — para que ninguém, além de você, tenha acesso ao conteúdo dos seus exames.",
          },
        ],
      },
      {
        heading: "Seus direitos como titular (LGPD)",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Acesso e portabilidade",
                text: "Acessar seus exames e baixar os relatórios gerados a qualquer momento.",
              },
              {
                label: "Retificação",
                text: "Corrigir dados que tenham sido extraídos incorretamente pelo sistema.",
              },
              {
                label: "Revogação e exclusão",
                text: "Solicitar a exclusão definitiva da sua conta e de todo o histórico de exames dos servidores do Oria — basta usar a opção “Excluir conta” no painel ou escrever para privacidade@oria.com.br.",
              },
            ],
          },
        ],
      },
      {
        heading: "Encarregado de Dados (DPO)",
        blocks: [
          {
            type: "p",
            text: "Para dúvidas sobre esta política, para exercer seus direitos ou para falar sobre como seus dados são tratados, fale com o nosso Encarregado de Proteção de Dados (DPO) pelo e-mail dpo@oria.com.br.",
          },
        ],
      },
    ],
    footnote:
      "Tratamos cada dado com tecnologia criptografada e nunca o compartilhamos com empresas terceiras.",
  },

  terms: {
    icon: "file-text",
    eyebrow: "Termos & Condições",
    title: "Termos e Condições de Uso",
    updated: "Última atualização: junho de 2026",
    intro:
      "Ao criar uma conta e utilizar o Oria, você concorda integralmente com estes Termos e Condições de Uso, com a nossa Política de Privacidade e com o nosso Aviso Médico. Caso não concorde com qualquer diretriz, você não deverá utilizar a plataforma.",
    sections: [
      {
        heading: "Descrição do serviço",
        blocks: [
          {
            type: "p",
            text: "O Oria é um hub inteligente de saúde que permite o upload de exames laboratoriais e médicos. Usando Inteligência Artificial, a plataforma processa esses arquivos para gerar relatórios visuais, explicativos e longitudinais, auxiliando na organização do seu histórico de saúde.",
          },
        ],
      },
      {
        heading: "Cadastro e segurança da conta",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Dados reais",
                text: "Você deve fornecer informações exatas, atualizadas e completas durante o cadastro.",
              },
              {
                label: "Confidencialidade",
                text: "Você é o único responsável por manter a confidencialidade das suas credenciais. Qualquer atividade realizada sob sua conta é de sua inteira responsabilidade.",
              },
              {
                label: "Uso pessoal",
                text: "A conta é pessoal e intransferível, desenhada para o controle da sua própria saúde ou de dependentes legais diretos.",
              },
            ],
          },
        ],
      },
      {
        heading: "Responsabilidades do usuário",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Envio de arquivos",
                text: "Comprometa-se a enviar apenas arquivos legíveis, sem adulterações e que pertençam a você ou a pessoas sob sua tutela legal.",
              },
              {
                label: "Uso adequado",
                text: "É proibido usar a plataforma para fins ilegais, burlar a segurança, realizar engenharia reversa, enviar códigos maliciosos ou utilizar bots e web scraping para extrair dados.",
              },
              {
                label: "Exclusão e suspensão",
                text: "O Oria reserva-se o direito de suspender ou encerrar contas que violem estas regras de conduta.",
              },
            ],
          },
        ],
      },
      {
        heading: "Propriedade intelectual",
        blocks: [
          {
            type: "p",
            text: "Todo o conteúdo do Oria — incluindo código-fonte, algoritmos de IA, design de interface (UI/UX), logotipos, textos e arquitetura de software — é de propriedade exclusiva do Oria. É vedada a cópia, reprodução, distribuição ou criação de obras derivadas sem autorização expressa.",
          },
        ],
      },
      {
        heading: "Limitação de responsabilidade",
        blocks: [
          {
            type: "list",
            items: [
              {
                label: "Disponibilidade do sistema",
                text: "Trabalhamos para manter o Oria disponível 24h por dia, mas o acesso pode ser interrompido por manutenções, atualizações ou falhas na infraestrutura de nuvem. Não nos responsabilizamos por perdas decorrentes de indisponibilidade.",
              },
              {
                label: "Precisão da IA",
                text: "A tecnologia de extração (OCR e IA) pode apresentar inconsistências ao ler exames originais. Cabe ao usuário conferir o relatório gerado em comparação com o laudo original do laboratório.",
              },
            ],
          },
        ],
      },
      {
        heading: "Atualização dos termos",
        blocks: [
          {
            type: "p",
            text: "O Oria está em constante evolução. Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas na plataforma ou por e-mail, e o uso contínuo do serviço após as mudanças constitui aceitação dos novos termos.",
          },
        ],
      },
      {
        heading: "Legislação aplicável e foro",
        blocks: [
          {
            type: "p",
            text: "Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer dúvidas ou litígios, fica eleito o foro da Comarca de Brasília, Distrito Federal, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
          },
        ],
      },
    ],
  },

  medical: {
    icon: "stethoscope",
    eyebrow: "Aviso Médico",
    title: "Aviso Médico",
    updated: "Última atualização: junho de 2026",
    intro:
      "O Oria foi desenvolvido como uma ferramenta tecnológica e educacional para auxiliar na organização, visualização e acompanhamento dos seus exames laboratoriais e marcadores de saúde. O Oria não é um serviço médico, clínica ou laboratório, e os relatórios gerados não constituem aconselhamento médico.",
    sections: [
      {
        heading: "Ausência de diagnóstico ou prescrição",
        blocks: [
          {
            type: "p",
            text: "A Inteligência Artificial do Oria interpreta dados com base em padrões gerais e literatura pública, mas desconhece o seu histórico clínico completo, genética, estilo de vida, sintomas atuais e demais variáveis fisiológicas.",
          },
          {
            type: "highlight",
            icon: "info",
            text: "O Oria jamais fornece diagnósticos, não emite laudos médicos e não prescreve ou sugere tratamentos.",
          },
        ],
      },
      {
        heading: "O perigo da automedicação",
        blocks: [
          {
            type: "p",
            text: "Você concorda expressamente que nunca deve alterar dosagens de medicamentos, interromper tratamentos, ignorar orientações médicas prévias ou iniciar novos protocolos de saúde baseando-se exclusivamente nos gráficos, alertas ou interpretações geradas pela plataforma.",
          },
        ],
      },
      {
        heading: "Limitações técnicas e extração de dados",
        blocks: [
          {
            type: "p",
            text: "O processamento automatizado de PDFs e imagens está sujeito a falhas de extração, leitura ou organização de dados. O relatório visual do Oria não substitui o arquivo original do seu exame.",
          },
          {
            type: "highlight",
            icon: "file-check",
            text: "Em caso de divergência de valores, o documento original expedido pelo laboratório deve ser considerado a única fonte oficial e verdadeira.",
          },
        ],
      },
      {
        heading: "Validação médica obrigatória",
        blocks: [
          {
            type: "highlight",
            icon: "heart-pulse",
            text: "Qualquer variação, alerta ou alteração apontada nos relatórios do Oria deve ser obrigatoriamente validada e discutida com o seu médico ou profissional de saúde de confiança durante uma consulta clínica adequada.",
          },
        ],
      },
    ],
  },
};

/* ── Block renderers ───────────────────────────────────────────── */
function BlockView({ block }: { block: Block }) {
  if (block.type === "p") {
    return <p className="oria-legal-p">{block.text}</p>;
  }
  if (block.type === "highlight") {
    return (
      <div className="oria-legal-highlight">
        <span className="oria-legal-highlight-icon" aria-hidden="true">
          <Icon name={block.icon} size={18} color="currentColor" />
        </span>
        <p>{block.text}</p>
      </div>
    );
  }
  return (
    <ul className="oria-legal-list">
      {block.items.map((it, i) => (
        <li key={i}>
          <span className="oria-legal-list-dot" aria-hidden="true" />
          <span>
            <strong>{it.label}.</strong> {it.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Modal ─────────────────────────────────────────────────────── */
export function LegalModal({
  docKey,
  onClose,
}: {
  docKey: LegalDocKey | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = docKey !== null;

  /* Focus the close button and lock body scroll while open. */
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!docKey) return null;
  const doc = LEGAL_DOCS[docKey];

  return (
    <>
      <div className="oria-legal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="oria-legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oria-legal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="oria-legal-head">
          <div className="oria-legal-head-main">
            <span className="oria-legal-head-icon" aria-hidden="true">
              <Icon name={doc.icon} size={22} color="currentColor" />
            </span>
            <div>
              <div className="oria-legal-eyebrow">{doc.eyebrow}</div>
              <h2 id="oria-legal-title" className="oria-legal-title">
                {doc.title}
              </h2>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="oria-legal-close"
          >
            <Icon name="x" size={17} color="currentColor" />
          </button>
        </div>

        <div className="oria-legal-body">
          <p className="oria-legal-intro">{doc.intro}</p>

          <div className="oria-legal-sections">
            {doc.sections.map((sec, i) => (
              <section key={i} className="oria-legal-section">
                <div className="oria-legal-section-head">
                  <span className="oria-legal-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="oria-legal-section-title">{sec.heading}</h3>
                </div>
                <div className="oria-legal-section-body">
                  {sec.blocks.map((b, bi) => (
                    <BlockView key={bi} block={b} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {doc.footnote && (
            <div className="oria-legal-footnote">
              <Icon name="lock" size={15} color="currentColor" />
              <span>{doc.footnote}</span>
            </div>
          )}
        </div>

        <div className="oria-legal-foot">
          <span className="oria-legal-updated">{doc.updated}</span>
          <button
            type="button"
            onClick={onClose}
            className="oria-legal-foot-btn"
          >
            Entendi
          </button>
        </div>
      </div>
    </>
  );
}
