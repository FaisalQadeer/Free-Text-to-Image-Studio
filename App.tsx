
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedImage, Theme } from './types';
import { generateImage, editImage } from './services/geminiService';
import { Button } from './components/Button';
import { ImageCard } from './components/ImageCard';
import { Sparkles, Moon, Sun, History, Wand2, X, Upload, ArrowRight, ShieldCheck, Info, Mail, AlertCircle, Home } from 'lucide-react';

type ViewType = 'home' | 'history' | 'about' | 'contact' | 'privacy' | 'disclaimer';

const App: React.FC = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [activeTab, setActiveTab] = useState<ViewType>('home');
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lumina-art-images');
    if (saved) setImages(JSON.parse(saved));
    
    const savedTheme = localStorage.getItem('lumina-art-theme');
    if (savedTheme) setTheme(savedTheme as Theme);
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina-art-images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('lumina-art-theme', theme);
    document.documentElement.classList.toggle('dark', theme === Theme.DARK);
  }, [theme]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: Date.now(),
        isFavorite: false,
        type: 'generation'
      };
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
      setActiveTab('history');
    } catch (err) {
      alert("Failed to generate image. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    const source = uploadedImage || editingImage?.url;
    if (!source || !editInstruction.trim()) return;
    
    setIsGenerating(true);
    try {
      const url = await editImage(source, editInstruction);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt: editInstruction,
        timestamp: Date.now(),
        isFavorite: false,
        type: 'edit'
      };
      setImages(prev => [newImage, ...prev]);
      setEditingImage(null);
      setUploadedImage(null);
      setEditInstruction('');
      setActiveTab('history');
    } catch (err) {
      alert("Failed to edit image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setEditingImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col items-center gap-12 fade-in">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-5xl font-outfit font-black tracking-tight leading-tight">
                Turn your <span className="text-blue-500 neon-text">vision</span> into <span className="text-purple-500">reality</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Enter a prompt to generate or upload an image to edit with AI instructions.
              </p>
            </div>

            <div className="w-full max-w-3xl space-y-6">
              <div className="glass p-8 rounded-3xl shadow-2xl space-y-6">
                
                {/* Image Preview for Editing */}
                {(uploadedImage || editingImage) && (
                  <div className="relative group rounded-xl overflow-hidden max-w-sm mx-auto shadow-xl ring-1 ring-white/20">
                    <img 
                      src={uploadedImage || editingImage?.url} 
                      className="w-full h-auto object-cover" 
                      alt="Preview" 
                    />
                    <button 
                      onClick={() => { setUploadedImage(null); setEditingImage(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-blue-600/90 text-[10px] font-bold uppercase text-center tracking-widest">
                      Editing Mode Active
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <textarea 
                      value={uploadedImage || editingImage ? editInstruction : prompt}
                      onChange={(e) => uploadedImage || editingImage ? setEditInstruction(e.target.value) : setPrompt(e.target.value)}
                      placeholder={uploadedImage || editingImage ? "How should I modify this? e.g. 'Add a sunset', 'Make it neon'..." : "Describe the image you want to see... e.g. 'A futuristic city in the clouds, cyberpunk style'"}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                       <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <Button 
                        variant="secondary" 
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadedImage ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <Button 
                        isLoading={isGenerating} 
                        onClick={uploadedImage || editingImage ? handleEdit : handleGenerate}
                        disabled={!(uploadedImage || editingImage ? editInstruction : prompt)}
                        className="px-8 py-2"
                      >
                        <Wand2 className="w-5 h-5" />
                        {uploadedImage || editingImage ? 'Apply Edits' : 'Generate'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {!uploadedImage && !editingImage && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Cyberpunk cat', 'Astronaut on Mars', 'Vibrant oil painting of a forest', '3D render of a glass robot'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setPrompt(s)}
                      className="px-3 py-1.5 rounded-full glass text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-8 fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-outfit font-bold flex items-center gap-2">
                <History className="w-8 h-8 text-blue-500" />
                Gallery
              </h2>
              <div className="text-slate-400 text-sm">
                {images.length} images saved
              </div>
            </div>

            {images.length === 0 ? (
              <div className="glass p-20 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-medium">No masterpieces yet</h3>
                <p className="text-slate-500">Go to the home tab to start generating art!</p>
                <Button variant="secondary" onClick={() => setActiveTab('home')}>
                  Let's Create <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map(img => (
                  <ImageCard 
                    key={img.id} 
                    image={img} 
                    onDelete={deleteImage}
                    onToggleFavorite={toggleFavorite}
                    onEdit={(img) => {
                      setEditingImage(img);
                      setUploadedImage(null);
                      setActiveTab('home');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'about':
        return (
          <div className="max-w-3xl mx-auto space-y-8 fade-in">
            <h2 className="text-4xl font-outfit font-bold flex items-center gap-3">
              <Info className="w-8 h-8 text-blue-500" /> About Free Text to Image
            </h2>
            <div className="glass p-8 rounded-3xl space-y-4 leading-relaxed text-slate-300">
              <p>Free Text to Image is a state-of-the-art visual generation tool powered by Google's Gemini 2.5 Flash Image model. Our mission is to democratize digital art creation by providing a simple, fast, and high-quality interface for everyone.</p>
              <p>Whether you are a concept artist looking for inspiration, a social media manager in need of unique visuals, or just someone who wants to see their wildest ideas come to life, our AI is built to understand and execute your vision with stunning precision.</p>
              <p>Everything you create here is processed in real-time. We leverage cutting-edge neural networks to interpret your text prompts and translate them into beautiful imagery.</p>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-3xl mx-auto space-y-8 fade-in">
            <h2 className="text-4xl font-outfit font-bold flex items-center gap-3">
              <Mail className="w-8 h-8 text-purple-500" /> Contact Us
            </h2>
            <div className="glass p-8 rounded-3xl space-y-6">
              <p className="text-slate-300">Have questions, feedback, or need support? We'd love to hear from you.</p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-400">Email Address</label>
                  <input type="email" placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-400">Message</label>
                  <textarea placeholder="How can we help?" className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
                <Button className="w-full" onClick={() => alert('Message sent (Demo)')}>Send Message</Button>
              </form>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="max-w-3xl mx-auto space-y-8 fade-in">
            <h2 className="text-4xl font-outfit font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-green-500" /> Privacy Policy
            </h2>
            <div className="glass p-8 rounded-3xl space-y-4 text-slate-300 leading-relaxed">
              <p>Your privacy is paramount. Free Text to Image is designed to be a transparent and secure tool.</p>
              <h3 className="text-xl font-bold text-white mt-4">Data Collection</h3>
              <p>We do not store your generated images on our central servers permanently. Images are saved locally in your browser's storage (LocalStorage). If you clear your browser data, your images will be lost.</p>
              <h3 className="text-xl font-bold text-white mt-4">AI Processing</h3>
              <p>When you generate an image, your text prompt and any uploaded images are sent to Google's Gemini API for processing. Please refer to Google's Privacy Policy for information on how they handle AI input data.</p>
              <h3 className="text-xl font-bold text-white mt-4">Cookies</h3>
              <p>We use minimal cookies for essential site functionality and to remember your theme preferences.</p>
            </div>
          </div>
        );

      case 'disclaimer':
        return (
          <div className="max-w-3xl mx-auto space-y-8 fade-in">
            <h2 className="text-4xl font-outfit font-bold flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" /> Disclaimer
            </h2>
            <div className="glass p-8 rounded-3xl space-y-4 text-slate-300 leading-relaxed">
              <p>Please read this disclaimer carefully before using Free Text to Image.</p>
              <h3 className="text-xl font-bold text-white mt-4">AI-Generated Content</h3>
              <p>All images provided by this service are generated by Artificial Intelligence. They do not represent real people, places, or events unless specified. The results can sometimes be unpredictable or contain artifacts.</p>
              <h3 className="text-xl font-bold text-white mt-4">Usage & Ownership</h3>
              <p>Users are responsible for the prompts they enter. Do not use this tool to generate harmful, illegal, or copyright-infringing content. We do not claim ownership over the images you generate; however, usage rights may be subject to the terms of the underlying AI model provider (Google Gemini).</p>
              <h3 className="text-xl font-bold text-white mt-4">No Warranty</h3>
              <p>The service is provided "as is" without warranty of any kind. We are not liable for any damages arising from the use or inability to use the service.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'Gallery', icon: History },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === Theme.DARK ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 glass-dark px-4 md:px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/50 group-hover:scale-110 transition-transform">
            <img 
              src="https://r.jina.ai/i/6c3d97d4b4764831b145a550d9c9a29d" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="hidden sm:block text-xl font-outfit font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Free Text to Image
          </h1>
        </div>

        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as ViewType)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
              >
                <Icon className="w-3.5 h-3.5 sm:hidden" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button 
          onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
          className="p-2 rounded-full glass hover:bg-white/10 transition-colors shrink-0"
        >
          {theme === Theme.DARK ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {renderContent()}
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs font-medium uppercase tracking-widest">
          <button onClick={() => setActiveTab('home')} className="hover:text-blue-500 transition-colors">Home</button>
          <button onClick={() => setActiveTab('history')} className="hover:text-blue-500 transition-colors">Gallery</button>
          <button onClick={() => setActiveTab('about')} className="hover:text-blue-500 transition-colors">About</button>
          <button onClick={() => setActiveTab('contact')} className="hover:text-blue-500 transition-colors">Contact</button>
          <button onClick={() => setActiveTab('privacy')} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
          <button onClick={() => setActiveTab('disclaimer')} className="hover:text-blue-500 transition-colors">Disclaimer</button>
        </div>
        <p>© 2024 Free Text to Image. Powered by Gemini 2.5 Flash Image.</p>
      </footer>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-outfit font-bold text-white">Synthesizing Pixels...</h3>
            <p className="text-slate-400 max-w-xs px-4">Our AI is dreaming up your request. This usually takes just a few seconds.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
