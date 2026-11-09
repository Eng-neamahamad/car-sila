import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TranslateControl } from '../common/TranslatedText';
import { ChatPhoto, readChatPhoto } from '../common/ChatPhoto';
import { Conversation } from '../../types';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  ChevronLeft,
  CheckCheck
} from 'lucide-react';

const latestAt = (conversation: Conversation) =>
  conversation.messages[conversation.messages.length - 1]?.createdAt || '';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    vehicles,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    markMessagesRead,
    t,
    language
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [mobileList, setMobileList] = useState(!activeConversationId);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const apply = () => setNarrow(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  const sorted = [...conversations].sort((a, b) => latestAt(b).localeCompare(latestAt(a)));
  const picked = sorted.find((item) => item.id === activeConversationId) || null;
  const selected = picked || (narrow ? null : sorted[0] || null);
  const showList = !narrow || mobileList || !picked;
  const showThread = Boolean(selected) && (!narrow || (Boolean(picked) && !mobileList));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showThread) scrollToBottom();
  }, [selected?.messages, showThread]);

  useEffect(() => {
    if (!showThread || !selected || selected.side === 'reporter' || !(selected.unreadCount > 0)) return;
    markMessagesRead(selected.id);
  }, [showThread, selected?.id, selected?.side, selected?.unreadCount]);

  const openConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileList(false);
  };

  const ownsPlate = (plate: string) => vehicles.some((item) => item.plateNumber === plate);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selected) return;
    sendMessage(selected.id, inputText, ownsPlate(selected.vehiclePlate) ? 'owner' : 'reporter');
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    if (!selected) return;
    sendMessage(selected.id, text, ownsPlate(selected.vehiclePlate) ? 'owner' : 'reporter');
  };

  if (!sorted.length) {
    return (
      <div className="bg-[#0a2430] rounded-3xl p-12 text-center border border-cyan-500/20">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-300">
          {language === 'ar' ? 'لا توجد محادثات نشطة حالياً.' : 'No active conversations.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a2430] rounded-3xl border border-cyan-500/20 shadow-sm overflow-hidden flex flex-col md:flex-row h-[70vh] min-h-[420px] max-h-[700px] text-start animate-fadeIn">
      {showList && (
        <aside className="flex h-full min-h-0 w-full flex-col border-cyan-500/10 md:w-80 md:shrink-0 md:border-e">
          <div className="border-b border-cyan-500/10 bg-[#041820] p-4">
            <h2 className="text-base font-extrabold text-white">
              {language === 'ar' ? 'المحادثات' : 'Conversations'}
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              {language === 'ar'
                ? `${sorted.length} أشخاص تواصلت معهم`
                : `${sorted.length} people you talked with`}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {sorted.map((item) => {
              const active = item.id === selected?.id && showThread;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openConversation(item.id)}
                  className={`flex w-full items-start gap-3 border-b border-cyan-500/10 px-4 py-3 text-start transition-colors cursor-pointer ${
                    active ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-xs font-bold text-white">
                    {(item.vehiclePlate || 'AR').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold text-white">{item.vehiclePlate}</p>
                      <span className="shrink-0 text-[10px] text-slate-400">{item.lastMessageTime}</span>
                    </div>
                    <p className="truncate text-[11px] text-slate-400">{item.vehicleName}</p>
                    <p className="mt-1 truncate text-xs text-slate-300">{readChatPhoto(item.lastMessage).text}</p>
                  </div>
                  {item.unreadCount > 0 && (
                    <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                      {item.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {showThread && selected && (
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-cyan-500/10 bg-[#041820] p-3 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              {narrow && (
                <button
                  type="button"
                  onClick={() => setMobileList(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 text-white cursor-pointer"
                  aria-label={language === 'ar' ? 'كل المحادثات' : 'All conversations'}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
              )}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-sm font-bold text-white shadow-md shadow-cyan-600/30">
                {(selected.vehiclePlate || 'AR').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-extrabold text-white">
                    {ownsPlate(selected.vehiclePlate)
                      ? t('anonymousReporter')
                      : (language === 'ar' ? 'صاحب السيارة' : 'Vehicle owner')}
                  </h3>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                    {t('online')}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  {selected.vehicleName} • {selected.vehiclePlate}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-1.5 rounded-full border border-cyan-500/20 bg-[#041820] px-3 py-1 text-xs font-semibold text-slate-300 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'محادثة مجهولة ومحمية' : 'End-to-End Anonymous'}</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#041820]/50 p-4 sm:p-6">
            <div className="my-2 text-center">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                🔒 {language === 'ar' ? 'الأرقام والهويات الشخصية مخفية تماماً' : 'Phone numbers and personal identities remain hidden'}
              </span>
            </div>

            {selected.messages.map((msg) => {
              const viewerOwns = ownsPlate(selected.vehiclePlate);
              const mine = viewerOwns ? msg.senderRole === 'owner' : msg.senderRole === 'reporter';
              const shown = readChatPhoto(msg.text, msg.photoReportId);
              const who = mine
                ? (language === 'ar' ? 'أنت' : 'You')
                : viewerOwns
                  ? (language === 'ar' ? 'المرسل' : 'Reporter')
                  : (language === 'ar' ? 'صاحب السيارة' : 'Owner');
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${mine ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div className={`max-w-md rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                    mine
                      ? 'rounded-br-none bg-cyan-500 text-white'
                      : 'rounded-bl-none border border-cyan-500/20 bg-[#0a2430] text-white'
                  }`}>
                    <p className={`mb-1 text-[10px] font-bold ${mine ? 'text-white/80' : 'text-cyan-300'}`}>{who}</p>
                    {shown.text && (
                      <TranslateControl
                        text={shown.text}
                        language={language}
                        alignEnd={mine}
                        className=""
                      />
                    )}
                    <ChatPhoto reportId={shown.reportId} />
                  </div>
                  <div className="mt-1 flex items-center gap-1 px-1">
                    <span className="text-[10px] font-medium text-slate-400">
                      {msg.timestamp}
                    </span>
                    {mine && <CheckCheck className="h-3 w-3 text-cyan-300" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto border-t border-cyan-500/10 bg-[#041820] px-4 py-2">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('quickReplies')}
            </span>
            {[t('quick1'), t('quick2'), t('quick3')].map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleQuickReply(reply)}
                className="whitespace-nowrap rounded-full border border-cyan-500/20 bg-[#0a2430] px-3 py-1 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-cyan-500/20 bg-[#0a2430] p-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('typeMessage')}
              className="flex-1 rounded-xl border border-cyan-500/20 bg-[#041820] px-4 py-2.5 text-sm text-white placeholder:text-slate-400 transition-all focus:bg-[#041820] focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="rounded-xl bg-cyan-500 p-3 text-white shadow-md shadow-cyan-600/30 transition-all hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4 rtl:rotate-180" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
