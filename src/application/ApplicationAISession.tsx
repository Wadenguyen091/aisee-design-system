import { Fragment, type ReactNode } from 'react';
import {
  AIConfirmation, AIConversation, AIDaySeparator, AIMessage, AIMessageStatus, AIPromptInput, AIReasoning, AIResponse, AITool,
  aiDayLabel, type AIConfirmationStatus, type AIModelId,
} from './ApplicationAI';

/**
 * Chat whose transcript belongs to a server session (v115, Cổng AI contract v0.1): the page passes the messages,
 * activities and approvals it rebuilt from the session's events; nothing is stored or generated here.
 * Activities and approvals of a job sit inside that job's answer (above its text, as tool calls do in AIChat);
 * before the answer exists they get an empty answer shell. One composer: Send, or Stop while a job runs; both can
 * be disabled with a reason.
 */
export type AISessionMessage = { id: string; jobId: string | null; role: 'user' | 'assistant'; text: string; status: 'streaming' | 'complete' | 'interrupted'; at: number };
export type AISessionActivity = { id: string; jobId: string | null; title: string; detail?: string; at: number };
export type AISessionApproval = {
  id: string; jobId: string; title: string; description: string; status: AIConfirmationStatus; at: number;
  /** The exact action (command, path, diff) — never credentials. */
  detail?: ReactNode; busy?: boolean; blocked?: string; onDecide: (allow: boolean) => void;
};

export type AISessionComposer = {
  status: 'idle' | 'streaming';
  onSubmit: (text: string) => void;
  onStop: () => void;
  placeholder?: string;
  sendBlocked?: string;
  stopBlocked?: string;
  hint?: ReactNode;
};

const NO_MODEL = 'auto' as AIModelId;
const time = (at: number) => new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export function AISessionChat({ label, assistant, messages, activities = [], approvals = [], empty, notice, composer, className = '' }: {
  label: string;
  /** Who answers (e.g. the connection: "Codex cá nhân 1"). */
  assistant: { name: string; avatar?: ReactNode };
  messages: AISessionMessage[];
  activities?: AISessionActivity[];
  approvals?: AISessionApproval[];
  /** Shown when there is nothing in the session yet. */
  empty?: ReactNode;
  /** One notice row above the conversation (offline, not ready, unknown delivery…). */
  notice?: ReactNode;
  composer: AISessionComposer;
  className?: string;
}) {
  const answers = new Set(messages.filter(message => message.role === 'assistant' && message.jobId).map(message => message.jobId));
  const extrasFor = (jobId: string | null) => ({
    activities: activities.filter(item => item.jobId === jobId).sort((a, b) => a.at - b.at),
    approvals: approvals.filter(item => item.jobId === jobId).sort((a, b) => a.at - b.at),
  });
  // Jobs that have activity or an approval but no answer yet get a shell right after their question.
  const shellAfter = new Map<string, string>();
  for (const message of messages) {
    if (message.role !== 'user' || !message.jobId || answers.has(message.jobId)) continue;
    const extras = extrasFor(message.jobId);
    if (extras.activities.length || extras.approvals.length) shellAfter.set(message.id, message.jobId);
  }

  const renderExtras = (jobId: string | null) => {
    const extras = extrasFor(jobId);
    return <>
      {extras.activities.map(item => <AITool key={item.id} name={item.title} status="done" output={item.detail} />)}
      {extras.approvals.map(item => <AIConfirmation key={item.id} title={item.title} description={item.description} status={item.status} busy={item.busy} blocked={item.blocked} onDecide={item.onDecide}>{item.detail}</AIConfirmation>)}
    </>;
  };

  return <section className={`ai-chat ai-session ${className}`.trim()} aria-label={label} data-layout="page" data-look="bubble" data-empty={!messages.length || undefined}>
    {notice && <div className="ai-session__notice">{notice}</div>}
    {messages.length === 0
      ? <div className="ai-chat__empty">{empty}</div>
      : <AIConversation>
        {messages.map((message, position) => {
          const previous = messages[position - 1];
          const day = !previous || aiDayLabel(previous.at) !== aiDayLabel(message.at) ? <AIDaySeparator label={aiDayLabel(message.at)} /> : null;
          if (message.role === 'user') {
            const shell = shellAfter.get(message.id);
            return <Fragment key={message.id}>{day}
              <div className="ai-chat__user"><AIMessage from="user" time={time(message.at)}>{message.text}</AIMessage></div>
              {shell && <AIMessage from="assistant" name={assistant.name} avatar={assistant.avatar}>{renderExtras(shell)}</AIMessage>}
            </Fragment>;
          }
          const waiting = message.status === 'streaming' && !message.text;
          return <Fragment key={message.id}>{day}
            <AIMessage from="assistant" name={assistant.name} avatar={assistant.avatar} time={time(message.at)}>
              {renderExtras(message.jobId)}
              {waiting ? <AIReasoning streaming text="" /> : message.text ? <AIResponse text={message.text} streaming={message.status === 'streaming'} /> : null}
              {message.status === 'interrupted' && <AIMessageStatus kind="stopped">Đã dừng giữa chừng.</AIMessageStatus>}
            </AIMessage>
          </Fragment>;
        })}
      </AIConversation>}
    <AIPromptInput
      variant="bar"
      status={composer.status}
      onSubmit={composer.onSubmit}
      onStop={composer.onStop}
      onEscape={composer.stopBlocked ? undefined : composer.onStop}
      placeholder={composer.placeholder}
      sendBlocked={composer.sendBlocked}
      stopBlocked={composer.stopBlocked}
      hint={composer.hint}
      slashCommands={[]}
      model={NO_MODEL}
      onModel={() => {}}
      attachments={[]}
      onAttach={() => {}}
      onRemoveAttachment={() => {}}
    />
  </section>;
}
