import fractionalCfo from "@/data/fractional-cfo.json";
import dentalCrm from "@/data/dental-crm.json";
import cfoAiOperators from "@/data/cfo-ai-operators.json";
import cfoIpPatent from "@/data/cfo-ip-patent-strategists.json";
import fractionalCsuiteDeepTech from "@/data/fractional-csuite-deep-tech.json";
import cfoFundraiseReadiness from "@/data/cfo-fundraise-readiness.json";
import aiCodingAssistants from "@/data/ai-coding-assistants.json";
import promptEngineeringTools from "@/data/prompt-engineering-tools.json";
import vectorDatabases from "@/data/vector-databases.json";
import ragFrameworks from "@/data/rag-frameworks.json";
import llmEvaluationPlatforms from "@/data/llm-evaluation-platforms.json";
import aiAgentBuilders from "@/data/ai-agent-builders.json";
import aiObservabilityPlatforms from "@/data/ai-observability-platforms.json";
import aiCustomerSupport from "@/data/ai-customer-support.json";
import aiSalesTools from "@/data/ai-sales-tools.json";
import aiMeetingAssistants from "@/data/ai-meeting-assistants.json";
import saasBookkeeping from "@/data/saas-bookkeeping.json";
import fractionalCoo from "@/data/fractional-coo.json";
import fractionalCmo from "@/data/fractional-cmo.json";
import fractionalCto from "@/data/fractional-cto.json";
import legalCrm from "@/data/legal-crm.json";
import realEstateCrm from "@/data/real-estate-crm.json";
import constructionProjectManagement from "@/data/construction-project-management.json";
import smbPayroll from "@/data/smb-payroll.json";
import smbHris from "@/data/smb-hris.json";
import noCodePlatforms from "@/data/no-code-platforms.json";
import automationPlatforms from "@/data/automation-platforms.json";
import capTableSoftware from "@/data/cap-table-software.json";
import treasuryManagementStartups from "@/data/treasury-management-startups.json";
import complianceAutomation from "@/data/compliance-automation.json";
import { SITE_URL } from "@/lib/schema";

export type ListData = typeof fractionalCfo;
type AnyEntry = Record<string, unknown>;

// Structured risk signals (winnable problem #4). Populated from real public sources
// WITH citations; level "none" means we checked and found nothing as of `checked`.
export type RiskCategory = "breach" | "lawsuit" | "billing" | "support";
export type RiskLevel = "none" | "low" | "moderate" | "elevated";
export type RiskSignal = {
  category: RiskCategory;
  summary: string;
  source_name: string;
  source_url: string;
  date?: string;
};
export type RiskSignals = {
  level: RiskLevel;
  checked: string;
  summary: string;
  signals: RiskSignal[];
};

// Registry of every published list. Add new lists here (and a data/<slug>.json).
const REGISTRY: Record<string, ListData> = {
  [fractionalCfo.slug]: fractionalCfo as ListData,
  [dentalCrm.slug]: dentalCrm as ListData,
  [cfoAiOperators.slug]: cfoAiOperators as unknown as ListData,
  [cfoIpPatent.slug]: cfoIpPatent as unknown as ListData,
  [fractionalCsuiteDeepTech.slug]: fractionalCsuiteDeepTech as unknown as ListData,
  [cfoFundraiseReadiness.slug]: cfoFundraiseReadiness as unknown as ListData,
  [aiCodingAssistants.slug]: aiCodingAssistants as unknown as ListData,
  [promptEngineeringTools.slug]: promptEngineeringTools as unknown as ListData,
  [vectorDatabases.slug]: vectorDatabases as unknown as ListData,
  [ragFrameworks.slug]: ragFrameworks as unknown as ListData,
  [llmEvaluationPlatforms.slug]: llmEvaluationPlatforms as unknown as ListData,
  [aiAgentBuilders.slug]: aiAgentBuilders as unknown as ListData,
  [aiObservabilityPlatforms.slug]: aiObservabilityPlatforms as unknown as ListData,
  [aiCustomerSupport.slug]: aiCustomerSupport as unknown as ListData,
  [aiSalesTools.slug]: aiSalesTools as unknown as ListData,
  [aiMeetingAssistants.slug]: aiMeetingAssistants as unknown as ListData,
  [saasBookkeeping.slug]: saasBookkeeping as unknown as ListData,
  [fractionalCoo.slug]: fractionalCoo as unknown as ListData,
  [fractionalCmo.slug]: fractionalCmo as unknown as ListData,
  [fractionalCto.slug]: fractionalCto as unknown as ListData,
  [legalCrm.slug]: legalCrm as unknown as ListData,
  [realEstateCrm.slug]: realEstateCrm as unknown as ListData,
  [constructionProjectManagement.slug]: constructionProjectManagement as unknown as ListData,
  [smbPayroll.slug]: smbPayroll as unknown as ListData,
  [smbHris.slug]: smbHris as unknown as ListData,
  [noCodePlatforms.slug]: noCodePlatforms as unknown as ListData,
  [automationPlatforms.slug]: automationPlatforms as unknown as ListData,
  [capTableSoftware.slug]: capTableSoftware as unknown as ListData,
  [treasuryManagementStartups.slug]: treasuryManagementStartups as unknown as ListData,
  [complianceAutomation.slug]: complianceAutomation as unknown as ListData,
};

export function listSlugs(): string[] {
  return Object.keys(REGISTRY);
}
export function getList(slug: string): ListData | null {
  return REGISTRY[slug] ?? null;
}

export function listIndex() {
  return {
    _meta: {
      schema: "top11-index-v1",
      self: `${SITE_URL}/api/lists`,
      openapi: `${SITE_URL}/openapi.json`,
      mcp: `${SITE_URL}/mcp`,
      generated_at: new Date().toISOString(),
    },
    count: listSlugs().length,
    lists: listSlugs().map((slug) => {
      const l = REGISTRY[slug];
      return {
        slug,
        title: l.title,
        vertical: l.vertical,
        human_page: `${SITE_URL}/${slug}`,
        api: `${SITE_URL}/api/lists/${slug}`,
        last_verified: l.last_verified,
        items: l.entries.length,
      };
    }),
  };
}

function matchIndex(l: ListData): Record<string, { solves: string[]; personas: string[] }> {
  return ((l as AnyEntry).match_index as Record<string, { solves: string[]; personas: string[] }>) || {};
}

export function listEnvelope(l: ListData) {
  const mi = matchIndex(l);
  return {
    _meta: {
      schema: "top11-list-v1",
      self: `${SITE_URL}/api/lists/${l.slug}`,
      human_page: `${SITE_URL}/${l.slug}`,
      markdown: `${SITE_URL}/api/lists/${l.slug}/md`,
      csv: `${SITE_URL}/api/lists/${l.slug}/csv`,
      recommend: `${SITE_URL}/api/lists/${l.slug}/recommend?problem={problem}&segment={segment}&budget={budget}`,
      llms_full: `${SITE_URL}/llms-full.txt`,
      openapi: `${SITE_URL}/openapi.json`,
      mcp: `${SITE_URL}/mcp`,
      license: "https://creativecommons.org/licenses/by/4.0/",
      generated_at: new Date().toISOString(),
    },
    ...l,
    entries: l.entries.map((e) => ({
      ...e,
      problems_solved: mi[String(e.rank)]?.solves ?? [],
      personas: mi[String(e.rank)]?.personas ?? [],
      _entry_api: `${SITE_URL}/api/lists/${l.slug}/${e.rank}`,
      _entry_md: `${SITE_URL}/api/lists/${l.slug}/${e.rank}/md`,
      _anchor: `${SITE_URL}/${l.slug}#rank-${e.rank}`,
    })),
  };
}

export function entryEnvelope(l: ListData, rank: number) {
  const e = l.entries.find((x) => x.rank === rank);
  if (!e) return null;
  const m = matchIndex(l)[String(rank)] || { solves: [], personas: [] };
  return {
    _meta: {
      schema: "top11-entry-v1",
      self: `${SITE_URL}/api/lists/${l.slug}/${rank}`,
      markdown: `${SITE_URL}/api/lists/${l.slug}/${rank}/md`,
      list: `${SITE_URL}/api/lists/${l.slug}`,
      anchor: `${SITE_URL}/${l.slug}#rank-${rank}`,
    },
    slug: l.slug,
    list_title: l.title,
    ...e,
    problems_solved: m.solves,
    personas: m.personas,
  };
}

export function toCsv(l: ListData): string {
  const cols = ["rank", "name", "url", "score_out_of_94", "best_for", "pricing_band", "hq", "founded", "team_size_band", "is_wildcard", "risk_level", "risk_summary"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cell = (e: AnyEntry, c: string): unknown => {
    const rs = e.risk_signals as RiskSignals | undefined;
    if (c === "risk_level") return rs?.level ?? "";
    if (c === "risk_summary") return rs?.summary ?? "";
    return e[c];
  };
  const rows = [cols.join(",")];
  for (const e of l.entries) rows.push(cols.map((c) => esc(cell(e as AnyEntry, c))).join(","));
  return rows.join("\n") + "\n";
}

export function toMarkdown(l: ListData): string {
  const md: string[] = [];
  md.push(`# ${l.title}`);
  md.push("");
  if ((l as AnyEntry).answer_capsule) md.push(`> ${(l as AnyEntry).answer_capsule}`);
  md.push("");
  md.push(`- URL: ${SITE_URL}/${l.slug}`);
  md.push(`- Last verified: ${l.last_verified}`);
  md.push(`- Methodology: ${SITE_URL}/methodology`);
  md.push(`- JSON: ${SITE_URL}/api/lists/${l.slug} · CSV: ${SITE_URL}/api/lists/${l.slug}/csv`);
  md.push("");
  md.push("## Ranking");
  md.push("");
  for (const e of l.entries) {
    const wild = (e as AnyEntry).is_wildcard ? " [WILDCARD]" : "";
    md.push(`### #${e.rank}${wild} ${e.name} · ${e.score_out_of_94}/9.4`);
    md.push(`- Best for: ${e.best_for}`);
    md.push(`- ${e.hq} · founded ${e.founded} · ${e.pricing_band}`);
    md.push(`- ${e.verdict}`);
    md.push(`- Pro: ${e.praise}`);
    md.push(`- Con: ${e.criticism}`);
    const rs = (e as AnyEntry).risk_signals as RiskSignals | undefined;
    if (rs) {
      md.push(`- Risk signals (${rs.level}, checked ${rs.checked}): ${rs.summary}`);
      for (const s of rs.signals) {
        md.push(`  - [${s.category}] ${s.summary} (${s.source_name}: ${s.source_url}${s.date ? `, ${s.date}` : ""})`);
      }
    }
    md.push("");
  }
  const faqs = (l as AnyEntry).faqs as { q: string; a: string }[] | undefined;
  if (faqs?.length) {
    md.push("## FAQ");
    md.push("");
    for (const f of faqs) {
      md.push(`**${f.q}**`);
      md.push("");
      md.push(f.a);
      md.push("");
    }
  }
  return md.join("\n") + "\n";
}
