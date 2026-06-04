import { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { chatWithData } from '@/app/services/dataService';
import { useMutation } from '@tanstack/react-query';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const sampleMessages: Message[] = [
  {
    id: '1',
    type: 'ai',
    content: 'Hello! I\'m your AI assistant for customer feedback intelligence. I can help you analyze trends, find insights, and answer questions about your feedback data. Try asking me something like "What are the most urgent issues?" or "How many reviews do we have?"',
    timestamp: new Date()
  }
];

const suggestionPrompts = [
  "How many reviews do we have?",
  "What is the overall sentiment?",
  "Show me critical issues",
  "What are the top feature requests?",
  "What are the most common problems?",
  "Summarize the negative feedback"
];

export function ChatWithDataPage() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState('');

  const mutation = useMutation({
    mutationFn: chatWithData,
    onSuccess: (aiResponseContent) => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  });

  const isLoading = mutation.isPending;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const prompt = input;
    setInput('');
    mutation.mutate(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Chat with Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ask questions about your customer feedback in natural language</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-indigo-100 dark:bg-indigo-900' 
                  : 'bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-4 ${
                  message.type === 'user'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-indigo-200 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions (show only if no messages from user yet) */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestionPrompts.slice(0, 4).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your feedback data..."
              className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button 
              onClick={handleSend} 
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-6"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}