import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  PaperAirplaneIcon, 
  ChatBubbleBottomCenterTextIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api, { aiAPI } from '../services/api';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello ${user?.name || 'there'}! I'm your Medical Assistant. How can I help you today?`, 
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const userMsg = {
      id: Date.now(),
      text: inputText,
      image: imagePreview,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    
    // Save current input and image for API call before clearing
    const currentText = inputText;
    const currentImage = imagePreview;
    
    setInputText('');
    removeImage();
    setIsLoading(true);

    try {
      // Call actual backend API
      const response = await aiAPI.chat(currentText, currentImage);
      
      const botMsg = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      // Smart integration: detect if AI suggests a doctor
      const lowerReply = response.data.reply.toLowerCase();
      if (lowerReply.includes('consult a') || lowerReply.includes('see a') || lowerReply.includes('specialist')) {
        const specializations = ['dermatologist', 'cardiologist', 'pediatrician', 'physician', 'orthopedic', 'neurologist', 'gastroenterologist', 'gynecologist', 'ophthalmologist', 'ent', 'dentist', 'psychiatrist'];
        const found = specializations.find(s => lowerReply.includes(s));
        
        if (found) {
          const suggestionMsg = {
            id: Date.now() + 2,
            text: `Would you like to book an appointment with a ${found}?`,
            sender: 'bot',
            suggestion: {
              label: `Find ${found.charAt(0).toUpperCase() + found.slice(1)}`,
              link: `/patient/search?specialization=${found}`
            },
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setTimeout(() => setMessages(prev => [...prev, suggestionMsg]), 1000);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI');
      
      const errorMsg = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-80px)] py-6 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-sm border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Medical AI Assistant</h2>
              <div className="flex items-center text-xs text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                Always here to help
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-gray-500 italic">
            Powered by Google Gemini
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border-x border-blue-100 p-2 text-[10px] sm:text-xs text-blue-700 flex items-center justify-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          General guidance only. Not a medical diagnosis. Consult a doctor for professional advice.
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gray-50 border-x overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-60 object-cover" />
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                {msg.suggestion && (
                  <Link 
                    to={msg.suggestion.link}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {msg.suggestion.label}
                  </Link>
                )}
                <div className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-xl shadow-sm border-t p-4">
          {imagePreview && (
            <div className="relative inline-block mb-4">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border shadow-sm" />
              <button 
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSend} className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type your health query..."
                className="w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 py-3 resize-none min-h-[50px] max-h-32 text-sm"
                rows="1"
              />
              <label className="absolute right-3 bottom-3 cursor-pointer text-gray-400 hover:text-blue-500 transition">
                <PhotoIcon className="h-6 w-6" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="bg-blue-600 text-white rounded-xl p-3 shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-center text-gray-400">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
