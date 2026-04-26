import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dashboardStructure from '../data/dashboard_structure.json';
import globalData from '../data/global.json';
import usData from '../data/us.json';
import americasData from '../data/americas.json';
import europeData from '../data/europe.json';
import africaData from '../data/africa.json';
import asiaData from '../data/asia.json';

const OPENROUTER_API_KEY = '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';
const MODEL_NAME = 'google/gemini-2.0-flash-lite-001';

// Helper to get data for active tab
const getTabData = (activeTab: string): any => {
  switch (activeTab) {
    case 'global': return globalData;
    case 'us': return usData;
    case 'americas': return americasData;
    case 'europe': return europeData;
    case 'africa': return africaData;
    case 'asia': return asiaData;
    default: return null;
  }
};

// Helper to extract key information from data (optionally for a specific page)
const extractKeyInfo = (data: any, pageTitle?: string): any => {
  if (!data || !data.pages) return null;

  // If pageTitle is provided, extract only that page's data
  if (pageTitle) {
    const page = data.pages.find((p: any) =>
      (p.page_headline && p.page_headline.trim().toLowerCase() === pageTitle.trim().toLowerCase()) ||
      (p.title && p.title.trim().toLowerCase() === pageTitle.trim().toLowerCase())
    );
    if (page) {
      return {
        report_info: data.report_info,
        page_headline: page.page_headline || page.title,
        key_insight: page.key_insight || page.key_insights,
        key_trends: page.key_trends,
        executive_summary: page.executive_summary,
        charts: page.charts
      };
    }
    // If not found, fallback to all data
  }

  // Default: extract summary for all pages (old behavior)
  return {
    report_info: data.report_info,
    summary: {
      total_pages: data.pages.length,
      key_insights: data.pages
        .filter((p: any) => p.key_insight || p.key_insights)
        .map((p: any) => ({
          page: p.page_number,
          headline: p.page_headline,
          insight: p.key_insight || p.key_insights
        })),
      key_trends: data.pages
        .filter((p: any) => p.key_trends)
        .flatMap((p: any) => p.key_trends),
      executive_summaries: data.pages
        .filter((p: any) => p.executive_summary)
        .map((p: any) => ({
          headline: p.page_headline || p.title,
          summary: p.executive_summary
        })),
      charts_available: data.pages
        .filter((p: any) => p.charts && Object.keys(p.charts).length > 0)
        .map((p: any) => ({
          page: p.page_number,
          charts: Object.keys(p.charts)
        }))
    }
  };
};

// Helper to create system prompt
const createSystemPrompt = (activeTab: string, pageTitle?: string): string => {
  const currentContext = pageTitle 
    ? `The user is viewing: "${pageTitle}"`
    : `The user is currently viewing the '${activeTab}' tab`;
  
  // Get actual data for the current tab (extract key info to keep prompt manageable)
  const tabData = getTabData(activeTab);
  // If pageTitle is available, extract only that page's data
  const keyInfo = tabData ? extractKeyInfo(tabData, pageTitle) : null;
  const dataContext = keyInfo 
    ? `\n\nACTUAL PAGE DATA (use this to answer questions):\n${JSON.stringify(keyInfo, null, 2)}`
    : '';
    
  return `You are a helpful, context-aware assistant for a data dashboard application. 
${currentContext}

IMPORTANT CONTEXT AWARENESS:
- Pay close attention to the current page title above
- If the page title mentions a specific subsector (like "Fintech", "Insurtech", "Banking"), focus ONLY on that subsector's data
- If the page title mentions a specific section (like "Global Trends", "Overview"), focus on that section's content
- Always acknowledge the current context in your responses

LANGUAGE RULE:
- If the user writes in Persian/Farsi (فارسی), respond in Persian/Farsi.
- If the user writes in English, respond in English.
- Match the user's language in your responses.

CRITICAL RULES FOR SUMMARIZATION:
1. ALWAYS be able to summarize. NEVER say "I cannot summarize" or "there is no summary section".
2. When asked to summarize or about trends, ACTIVELY EXTRACT information from the ACTUAL PAGE DATA below:
   - Look for "key_insights" arrays and list them
   - Look for "key_trends" arrays and present them
   - Look for "executive_summary" fields and use them
   - Look for chart information
3. If there's limited data, say "Based on the available data in this section: [list what you found]"
4. NEVER refuse to summarize. Always find SOMETHING to present from the data.


STRICT CONTEXT LOCKING:
5. If the user asks about a topic that is NOT present in the current tab's data, but it exists in another tab, politely tell the user which tab to navigate to (using the tab's name or ID), but DO NOT provide any data from that tab. For example: "This information is available in the 'Europe' tab." (or in Persian: «این اطلاعات در تب Europe موجود است.»)
6. If the answer does not exist in any tab, only mention what types of information are available in the current tab (e.g., key_insights, executive_summary, charts). For example: "There is no trend data, but I can provide key insights or executive summaries from this section."
7. Only discuss data that is explicitly mentioned in the data below.
8. Be proactive: extract numbers, trends, and insights from the data and present them clearly.

DASHBOARD STRUCTURE (Table of Contents):
${JSON.stringify(dashboardStructure, null, 2)}
${dataContext}
`;
};

// Helper to generate suggested questions based on current tab content
const generateSuggestedQuestions = (activeTab: string): string[] => {
  const currentTab = (dashboardStructure as any).tabs?.find((t: any) => t.id === activeTab);
  
  if (!currentTab || !currentTab.pages || currentTab.pages.length === 0) {
    return [
      "What data is available in this section?",
      "Summarize the key points",
      "What are the main trends?",
      "Show me the important metrics"
    ];
  }

  const questions: string[] = [];
  
  // Check what content is actually available
  const hasKeyInsights = currentTab.pages.some((p: any) => p.key_insights && p.key_insights.length > 0);
  const hasCharts = currentTab.pages.some((p: any) => p.charts && p.charts.length > 0);
  const hasKeyTrends = currentTab.pages.some((p: any) => p.key_trends && p.key_trends.length > 0);
  
  // Add summary question (AI should always be able to summarize)
  questions.push(`Summarize the key points in this section`);
  
  // Add questions based on available content
  if (hasKeyInsights) {
    questions.push(`What are the top insights here?`);
  }
  
  if (hasKeyTrends) {
    questions.push(`What are the main trends?`);
  }
  
  if (hasCharts) {
    const firstPageWithChart = currentTab.pages.find((p: any) => p.charts && p.charts.length > 0);
    if (firstPageWithChart && firstPageWithChart.charts[0]?.title) {
      questions.push(`Explain the ${firstPageWithChart.charts[0].title.toLowerCase()} chart`);
    }
  }
  
  // If we don't have enough questions, add a general one about the first page
  if (questions.length < 3 && currentTab.pages[0]?.title) {
    questions.push(`Tell me about ${currentTab.pages[0].title.toLowerCase()}`);
  }
  
  return questions.slice(0, 4);
};

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatbotProps {
  activeTab: string;
  onNavigate?: (tabId: string) => void;
}

export function Chatbot({ activeTab, onNavigate }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistory = useRef<Array<{role: string, content: string}>>([]);
  const lastActiveTab = useRef<string>(activeTab);
  const lastPageTitle = useRef<string>('');

  // Detect page changes within the same tab by monitoring the page title
  useEffect(() => {
    if (!isOpen) return;
    
    // Initialize lastPageTitle on first open
    if (lastPageTitle.current === '') {
      lastPageTitle.current = document.title;
    }
    
    // Set up interval to check for page title changes
    const checkPageTitle = () => {
      const currentTitle = document.title;
      
      if (lastPageTitle.current !== currentTitle && lastPageTitle.current !== '' && messages.length > 0) {
        // Page actually changed - notify user
        lastPageTitle.current = currentTitle;
        
        // Update system prompt to reflect current page context
        if (conversationHistory.current[0]) {
          conversationHistory.current[0] = {
            role: 'system',
            content: createSystemPrompt(activeTab, currentTitle)
          };
        }
        
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: `📄 Page changed: I've updated my context. Ask me anything about the current page!` 
        }]);
        
        // Show suggestions again after page change
        setShowSuggestions(true);
      }
    };
    
    // Check immediately and then every 500ms
    checkPageTitle();
    const interval = setInterval(checkPageTitle, 500);
    
    return () => clearInterval(interval);
  }, [isOpen, activeTab, messages.length]);

  // Generate suggested questions when tab changes or chat opens
  useEffect(() => {
    if (isOpen) {
      const questions = generateSuggestedQuestions(activeTab);
      setSuggestedQuestions(questions);
    }
  }, [activeTab, isOpen]);

  // Update system prompt when activeTab changes
  useEffect(() => {
    if (isOpen && lastActiveTab.current !== activeTab && messages.length > 0) {
      // Tab changed - update system prompt but keep conversation history
      lastActiveTab.current = activeTab;
      
      // Update only the system prompt (first message in history)
      // Use current page title if available
      const currentTitle = lastPageTitle.current || undefined;
      conversationHistory.current[0] = {
        role: 'system',
        content: createSystemPrompt(activeTab, currentTitle)
      };
      
      // Add a notification message to inform user
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `📍 Context updated: I'm now focused on the **${activeTab}** section. Your previous chat history is preserved. How can I help you with this section?` 
      }]);
      
      // Update suggested questions and show them
      const questions = generateSuggestedQuestions(activeTab);
      setSuggestedQuestions(questions);
      setShowSuggestions(true);
    }
  }, [activeTab, isOpen, messages.length]);

  // Initialize system prompt on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Get initial page title
      const initialTitle = document.title !== 'VC Insights' ? document.title : undefined;
      conversationHistory.current = [
        { role: 'system', content: createSystemPrompt(activeTab, initialTitle) }
      ];
      
      setMessages([{ 
        role: 'model', 
        content: `Hello! I am your dashboard assistant. I see you are looking at the ${activeTab} section. How can I help you today?` 
      }]);
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const processResponse = (text: string) => {
    // Check for navigation command
    const navMatch = text.match(/\[NAVIGATE:([\w-]+)\]/);
    if (navMatch && onNavigate) {
      const tabId = navMatch[1];
      onNavigate(tabId);
      return text.replace(/\[NAVIGATE:[\w-]+\]/, `(I've navigated you to the **${tabId}** section so you can see the data directly.)`);
    }
    return text;
  };

  const handleSend = async (customMessage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage || isLoading) return;

    // Hide suggestions after user sends first message
    setShowSuggestions(false);

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Add user message to conversation history
      conversationHistory.current.push({
        role: 'user',
        content: userMessage
      });

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'VC Insights Dashboard'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: conversationHistory.current,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Add assistant response to conversation history
      conversationHistory.current.push({
        role: 'assistant',
        content: assistantMessage
      });

      const processedText = processResponse(assistantMessage);
      setMessages(prev => [...prev, { role: 'model', content: processedText }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMsg = error?.message?.includes('429') || error?.message?.includes('quota')
        ? 'API quota exceeded. Please wait a minute and try again.'
        : 'Sorry, I encountered an error while processing your request.';
      setMessages(prev => [...prev, { role: 'model', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ... (button stays same) ... */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Dashboard Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <div className={`text-sm markdown-body prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-white' : 'text-slate-800'}`}>
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            
            {!isLoading && showSuggestions && suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-white border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the data..."
                className="flex-1 max-h-32 min-h-[44px] p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
