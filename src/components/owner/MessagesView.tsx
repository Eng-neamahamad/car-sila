import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Car,
  ChevronLeft,
  Sparkles,
  CheckCheck
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    t,
    language
  } = useApp();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputText, 'owner');
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.id, text, 'owner');
  };

  if (!activeConv) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">
          {language === 'ar' ? 'لا توجد محادثات نشطة حالياً.' : 'No active conversations.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px] text-start animate-fadeIn">
      
      {/* CHAT HEADER (Screen 13 top) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/30">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900">
                {t('anonymousReporter')}
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t('online')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {activeConv.vehicleName} • {activeConv.vehiclePlate}
            </p>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'ar' ? 'محادثة مجهولة ومحمية' : 'End-to-End Anonymous'}</span>
        </div>
      </div>

      {/* MESSAGES THREAD (Screen 13 middle) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {/* Privacy info bubble */}
        <div className="text-center my-2">
          <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-medium">
            🔒 {language === 'ar' ? 'الأرقام والهويات الشخصية مخفية تماماً' : 'Phone numbers and personal identities remain hidden'}
          </span>
        </div>

        {activeConv.messages.map((msg) => {
          const isOwner = msg.senderRole === 'owner';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  isOwner
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>

              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {msg.timestamp}
                </span>
                {isOwner && <CheckCheck className="w-3 h-3 text-blue-500" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK REPLIES PILLS (Screen 13 bottom) */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          {t('quickReplies')}
        </span>
        <button
          type="button"
          onClick={() => handleQuickReply(t('quick1'))}
          className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
        >
          {t('quick1')}
        </button>
        <button
          type="button"
          onClick={() => handleQuickReply(t('quick2'))}
          className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
        >
          {t('quick2')}
        </button>
        <button
          type="button"
          onClick={() => handleQuickReply(t('quick3'))}
          className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
        >
          {t('quick3')}
        </button>
      </div>

      {/* INPUT FORM (Screen 13 input) */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
        </button>
      </form>

    </div>
  );
};