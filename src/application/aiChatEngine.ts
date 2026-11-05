/*
 * Vault AI chat engine — transport layer for <AIChat>.
 *
 * Two transports share one contract, so the UI never knows which one answers:
 *  - "claude": the real model, reached through the claude.ai artifact runtime
 *    (`await window.claude.use('sample')`). Spends the viewer's own Claude usage and
 *    asks for consent on the first send. Supports streaming, Stop, model tiers,
 *    images and page tools (search/read Vault data, create a task).
 *  - "offline": a local simulator used everywhere the runtime is absent (vite dev,
 *    production builds without a backend). Same streaming, Stop and tool events,
 *    so every UI state can be tested without a network.
 *
 * Production can plug a third transport (e.g. a Supabase edge function) by
 * implementing `AITransport` — nothing in the UI changes.
 */
import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------ Types */

export type AIRole = 'user' | 'assistant';
export type AIWireMessage = { role: AIRole; content: string };
export type AITier = 'quick' | 'default' | 'complex';

export type AIToolEvent =
  | { phase: 'start'; id: string; name: string; input: Record<string, unknown> }
  | { phase: 'end'; id: string; name: string; output?: string; error?: string };

export type AISendOptions = {
  tier: AITier;
  signal: AbortSignal;
  onText: (text: string) => void;
  onTool?: (event: AIToolEvent) => void;
  images?: File[];
  tools?: boolean;
  /** Structured, JSON-safe data a transport attaches to the reply as it works (e.g. the gateway's policy checks). */
  onData?: (data: unknown) => void;
};

/**
 * `note` = a caption under the answer (e.g. "served by the fallback route"); `meta` = short badges beside the time
 * (model, cost). Both optional — a transport wrapper such as the AI gateway fills them in.
 */
export type AISendResult = { text: string; truncated: boolean; tierApplied?: AITier; note?: string; meta?: string[] };

/** Normalised failure. `code` follows the artifact runtime's codes; `text` is any partial answer. */
export type AIError = { code: string; message: string; text?: string };

export interface AITransport {
  kind: 'claude' | 'offline';
  label: string;
  canImages: boolean;
  canTools: boolean;
  send(messages: AIWireMessage[], options: AISendOptions): Promise<AISendResult>;
}

/* ------------------------------------------------------- Vault demo data */

export type VaultProject = { id: string; name: string; owner: string; status: 'Active' | 'Review' | 'Paused' | 'Done'; budget: string; deadline: string; summary: string };

export const VAULT_PROJECTS: VaultProject[] = [
  { id: 'VA-024', name: 'SALA Urban Experience', owner: 'Wade Nguyen', status: 'Active', budget: '₫480M', deadline: '15 Dec 2026', summary: 'Bản đồ tương tác, tour 3D và bộ nhận diện điểm đến cho khu SALA.' },
  { id: 'VA-023', name: 'THACO Mobility', owner: 'Minh Anh', status: 'Review', budget: '₫320M', deadline: '02 Nov 2026', summary: 'Pitch deck và motion cho dòng xe điện mới.' },
  { id: 'VA-022', name: 'Cleft Care Platform', owner: 'Trung Le', status: 'Active', budget: '₫210M', deadline: '20 Jan 2027', summary: 'Nền tảng đặt lịch và theo dõi điều trị.' },
  { id: 'VA-021', name: 'Future Classroom', owner: 'Linh Tran', status: 'Paused', budget: '₫160M', deadline: '—', summary: 'Bộ học liệu tương tác cho lớp học thông minh.' },
  { id: 'VA-020', name: 'VISAL Brand System', owner: 'Wade Nguyen', status: 'Review', budget: '₫190M', deadline: '06 Nov 2026', summary: 'Brand guideline v2 và design system VISAL.' },
];

/** Tasks created through the `create_task` tool during this page load. */
export const VAULT_TASKS: Array<{ id: string; project: string; title: string; due?: string }> = [];

const findProjects = (query = '', status = '') => {
  const q = query.trim().toLowerCase();
  return VAULT_PROJECTS.filter(project =>
    (!q || `${project.id} ${project.name} ${project.owner} ${project.summary}`.toLowerCase().includes(q))
    && (!status || project.status.toLowerCase() === status.toLowerCase()));
};

type ToolDef = { name: string; description: string; inputSchema: { type: 'object'; properties: Record<string, unknown>; required?: string[] }; run: (input: Record<string, unknown>) => unknown };

export const VAULT_TOOLS: ToolDef[] = [
  {
    name: 'search_projects',
    description: 'Search Vault projects by free text and/or status (Active, Review, Paused, Done). Returns id, name, owner, status, budget, deadline.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, status: { type: 'string' } } },
    run: input => findProjects(String(input.query ?? ''), String(input.status ?? '')).map(({ summary: _summary, ...rest }) => rest),
  },
  {
    name: 'get_project',
    description: 'Read one Vault project by id (e.g. VA-024): all fields including a one-line summary.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    run: input => {
      const project = VAULT_PROJECTS.find(item => item.id.toLowerCase() === String(input.id ?? '').toLowerCase());
      if (!project) throw new Error(`Không có dự án ${String(input.id)}`);
      return project;
    },
  },
  {
    name: 'create_task',
    description: 'Create a task in a Vault project. Use only when the user explicitly asks to create/add a task. Returns the created task.',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, title: { type: 'string' }, due: { type: 'string' } }, required: ['project_id', 'title'] },
    run: input => {
      const project = VAULT_PROJECTS.find(item => item.id.toLowerCase() === String(input.project_id ?? '').toLowerCase());
      if (!project) throw new Error(`Không có dự án ${String(input.project_id)}`);
      const task = { id: `T-${100 + VAULT_TASKS.length + 1}`, project: project.id, title: String(input.title ?? '').slice(0, 120), due: input.due ? String(input.due) : undefined };
      VAULT_TASKS.push(task);
      return task;
    },
  },
];

/* ---------------------------------------------------------- Instructions */

export const VAULT_AI_INSTRUCTIONS = [
  'Bạn là Vault AI, trợ lý trong Vault — workspace sáng tạo của VISAL Studio.',
  'Trả lời bằng tiếng Việt, trừ khi người dùng viết bằng ngôn ngữ khác. Ngắn gọn, đi thẳng vào ý.',
  'Định dạng Markdown đơn giản: **đậm**, `code`, danh sách "- " hoặc "1. ", tiêu đề "## ", khối code ```ngôn-ngữ. Không dùng bảng, không dùng HTML.',
  'Bạn không truy cập được web. Nếu được hỏi tin mới hoặc dữ liệu ngoài, nói rõ là không tra được.',
  'Dữ liệu dự án Vault chỉ lấy qua công cụ được cung cấp (nếu có). Không bịa id, ngân sách hay hạn chót.',
].join('\n');

/* --------------------------------------------------------- Claude transport */

type SampleFn = ((input: string | AIWireMessage[], options?: Record<string, unknown>) => Promise<{ text: string; truncated: boolean; modelTierApplied?: AITier }>) & {
  limits?: () => Promise<{ images?: unknown; tools?: unknown }>;
};
type ClaudeRuntime = { use: (name: string) => Promise<unknown> };

function claudeTransport(sample: SampleFn, limits: { images?: unknown; tools?: unknown } | null): AITransport {
  return {
    kind: 'claude',
    label: 'Claude',
    canImages: !!limits?.images,
    canTools: !!limits?.tools,
    async send(messages, { tier, signal, onText, onTool, images, tools }) {
      const options: Record<string, unknown> = {
        modelTier: tier,
        signal,
        onText: ({ text }: { text: string }) => onText(text),
      };
      if (images?.length && limits?.images) options.images = images;
      if (tools && limits?.tools) {
        options.tools = VAULT_TOOLS.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          execute: async (input: Record<string, unknown>) => {
            const id = `${tool.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            onTool?.({ phase: 'start', id, name: tool.name, input });
            try {
              const result = tool.run(input);
              const output = JSON.stringify(result);
              onTool?.({ phase: 'end', id, name: tool.name, output: output.length > 400 ? `${output.slice(0, 400)}…` : output });
              return result;
            } catch (error) {
              onTool?.({ phase: 'end', id, name: tool.name, error: error instanceof Error ? error.message : String(error) });
              throw error;
            }
          },
        }));
      } else {
        options.cache = false; // every chat turn must be a fresh answer
      }
      const wire: AIWireMessage[] = [{ role: 'user', content: VAULT_AI_INSTRUCTIONS }, ...messages];
      try {
        const result = await sample(wire, options);
        return { text: result.text, truncated: result.truncated, tierApplied: result.modelTierApplied };
      } catch (raw) {
        const error = raw as Partial<AIError>;
        throw { code: error?.code ?? 'upstream_error', message: error?.message ?? 'Lỗi không xác định', text: error?.text } satisfies AIError;
      }
    },
  };
}

/* -------------------------------------------------------- Offline transport */

export const aiWait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, ms);
  signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('aborted', 'AbortError')); }, { once: true });
});

function offlineAnswer(prompt: string, toolOutput?: unknown): string {
  const p = prompt.toLowerCase();
  if (toolOutput && Array.isArray(toolOutput)) {
    const rows = toolOutput as Array<{ id: string; name: string; status: string; deadline: string; owner: string }>;
    if (!rows.length) return 'Mình không tìm thấy dự án nào khớp. Thử từ khóa khác, ví dụ **SALA** hoặc trạng thái **Review**.';
    return `Tìm thấy **${rows.length} dự án**:\n\n| Dự án | Mã | Trạng thái | Phụ trách | Hạn |\n|---|---|---|---|---|\n${rows.map(row => `| **${row.name}** | \`${row.id}\` | ${row.status} | ${row.owner} | ${row.deadline} |`).join('\n')}\n\nBạn muốn mở chi tiết dự án nào?`;
  }
  if (toolOutput && typeof toolOutput === 'object' && 'title' in (toolOutput as object)) {
    const task = toolOutput as { id: string; project: string; title: string };
    return `Đã tạo task **${task.title}** (\`${task.id}\`) trong dự án \`${task.project}\`.`;
  }
  if (/code|hàm|function|component|react/.test(p)) {
    return 'Ví dụ component dùng `VaultSheet` của hệ thống:\n\n```tsx\nexport function ProjectPanel({ open, onClose }: { open: boolean; onClose: () => void }) {\n  return <VaultSheet open={open} onClose={onClose} title="SALA" size="md">\n    <p>Chi tiết dự án</p>\n  </VaultSheet>;\n}\n```\n\nĐây là câu trả lời **mô phỏng** — kết nối Claude để có code thật.';
  }
  if (/xin chào|chào|hello|hi\b/.test(p)) return 'Chào bạn! Mình là **Vault AI**. Mình có thể tìm dự án, tóm tắt brief hoặc tạo task. Thử hỏi: *"Dự án nào đang Review?"*';
  return `Mình đã nhận: “${prompt.slice(0, 140)}${prompt.length > 140 ? '…' : ''}”.\n\n## Chế độ mô phỏng\n\nTrang này chưa kết nối Claude nên câu trả lời được tạo cục bộ để test giao diện:\n\n1. Gửi, dừng, xếp hàng tin nhắn\n2. Tạo lại và chuyển phiên bản\n3. Sửa tin nhắn đã gửi\n4. Đính kèm tệp và gọi công cụ Vault\n\nMở trang trong claude.ai để chat với Claude thật.`;
}

/** Streams a finished answer in small chunks (offline simulators). On Stop it throws `cancelled` with the partial text. */
export async function aiStreamText(answer: string, signal: AbortSignal, onText: (text: string) => void) {
  let shown = '';
  for (const chunk of answer.match(/[\s\S]{1,6}/g) ?? []) {
    if (signal.aborted) throw { code: 'cancelled', message: 'Đã dừng', text: shown } satisfies AIError;
    await aiWait(18, signal).catch(() => { throw { code: 'cancelled', message: 'Đã dừng', text: shown } satisfies AIError; });
    shown += chunk;
    onText(shown);
  }
  return answer;
}

export const offlineTransport: AITransport = {
  kind: 'offline',
  label: 'Mô phỏng',
  canImages: false,
  canTools: true,
  async send(messages, { signal, onText, onTool, tools }) {
    const prompt = messages.at(-1)?.content ?? '';
    const p = prompt.toLowerCase();
    let toolOutput: unknown;
    await aiWait(700, signal);
    if (tools) {
      const create = /tạo task|thêm task|create task/.test(p);
      const search = /dự án|project|review|active|paused|sala|thaco/.test(p);
      if (create || search) {
        const tool = create ? VAULT_TOOLS[2] : VAULT_TOOLS[0];
        const input = create
          ? { project_id: (prompt.match(/VA-\d{3}/i)?.[0] ?? 'VA-024').toUpperCase(), title: prompt.replace(/.*(tạo task|thêm task|create task)\s*/i, '').slice(0, 60) || 'Task mới' }
          : { query: /sala|thaco|cleft|future|visal/.exec(p)?.[0] ?? '', status: /review|active|paused|done/.exec(p)?.[0] ?? '' };
        const id = `${tool.name}-${Date.now()}`;
        onTool?.({ phase: 'start', id, name: tool.name, input });
        await aiWait(500, signal);
        try {
          toolOutput = tool.run(input);
          onTool?.({ phase: 'end', id, name: tool.name, output: JSON.stringify(toolOutput).slice(0, 400) });
        } catch (error) {
          onTool?.({ phase: 'end', id, name: tool.name, error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
    if (/lỗi thử|test error/.test(p)) throw { code: 'upstream_error', message: 'Lỗi mô phỏng để test giao diện' } satisfies AIError;
    const answer = await aiStreamText(offlineAnswer(prompt, toolOutput), signal, onText);
    return { text: answer, truncated: false, tierApplied: undefined };
  },
};

/* --------------------------------------------------------------- Resolver */

export type AITransportState = { transport: AITransport; status: 'connecting' | 'ready' };

/**
 * Resolves the best transport for this view: Claude when the artifact runtime grants
 * `sample`, otherwise the offline simulator. Starts on offline so the UI is usable at once.
 */
export function useAITransport(): AITransportState {
  const [state, setState] = useState<AITransportState>({ transport: offlineTransport, status: 'connecting' });
  useEffect(() => {
    let alive = true;
    const runtime = (window as unknown as { claude?: ClaudeRuntime }).claude;
    if (!runtime?.use) { setState({ transport: offlineTransport, status: 'ready' }); return; }
    runtime.use('sample').then(async value => {
      if (!alive) return;
      const sample = value as SampleFn | null;
      if (!sample) { setState({ transport: offlineTransport, status: 'ready' }); return; }
      const limits = await sample.limits?.().catch(() => null) ?? null;
      if (alive) setState({ transport: claudeTransport(sample, limits), status: 'ready' });
    }).catch(() => { if (alive) setState({ transport: offlineTransport, status: 'ready' }); });
    return () => { alive = false; };
  }, []);
  return state;
}

/* ---------------------------------------------------------------- Helpers */

/** Rough token estimate (≈4 characters per token) for the context meter. */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);

/** Viewer-facing copy for each failure code. */
export function aiErrorCopy(code: string, message?: string): string {
  switch (code) {
    case 'blocked': return message || 'Lệnh gọi bị chặn bởi chính sách.';
    case 'not_granted': return 'Bạn chưa cho phép trang này dùng Claude. Đang chuyển sang chế độ mô phỏng.';
    case 'sampling_disabled': case 'capability_disabled': case 'not_declared': case 'capability_removed': return 'Claude không khả dụng ở đây. Đang dùng chế độ mô phỏng.';
    case 'rate_limited': return 'Đang gửi quá nhiều hoặc đã chạm giới hạn sử dụng. Đợi một lát rồi thử lại.';
    case 'session_expired': return 'Phiên đăng nhập đã hết hạn. Đăng nhập lại claude.ai rồi thử lại.';
    case 'prompt_too_large': return 'Cuộc trò chuyện quá dài. Bắt đầu cuộc trò chuyện mới hoặc bớt tệp đính kèm.';
    case 'refused': return 'Claude từ chối yêu cầu này. Thử diễn đạt khác.';
    case 'image_rejected': return 'Ảnh không hợp lệ (định dạng hoặc kích thước). Chọn ảnh khác.';
    case 'images_unavailable': return 'Trang này không gửi được ảnh. Ảnh đã được bỏ qua.';
    case 'empty_completion': return 'Không nhận được câu trả lời. Thử hỏi ngắn hơn.';
    default: return 'Kết nối bị gián đoạn. Thử lại.';
  }
}

/** Codes after which the page should stop using Claude for this view. */
export const AI_FATAL_CODES = new Set(['not_granted', 'sampling_disabled', 'capability_disabled', 'not_declared', 'capability_removed']);
