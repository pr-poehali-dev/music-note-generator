import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Note {
  name: string;
  frequency: number;
  timestamp: number;
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/'))) {
      processFile(droppedFile);
    } else {
      toast.error('Пожалуйста, загрузите аудио или видео файл');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setAudioUrl(URL.createObjectURL(uploadedFile));
    toast.success(`Файл ${uploadedFile.name} загружен`);
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const mockNotes: Note[] = [
        { name: 'C4', frequency: 261.63, timestamp: 0.5 },
        { name: 'E4', frequency: 329.63, timestamp: 1.0 },
        { name: 'G4', frequency: 392.00, timestamp: 1.5 },
        { name: 'C5', frequency: 523.25, timestamp: 2.0 },
        { name: 'A4', frequency: 440.00, timestamp: 2.5 },
        { name: 'F4', frequency: 349.23, timestamp: 3.0 },
        { name: 'D4', frequency: 293.66, timestamp: 3.5 },
        { name: 'G4', frequency: 392.00, timestamp: 4.0 },
      ];
      setNotes(mockNotes);
      setIsProcessing(false);
      toast.success('Распознавание завершено!');
    }, 2000);
  };

  const pianoKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2D1B4E] to-[#1A1F2C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-3">
            <Icon name="Music" size={48} className="text-[#8B5CF6]" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
              NoteScribe
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Загрузите аудио или видео, и получите полную нотную запись с высокой точностью распознавания
          </p>
        </header>

        <Card
          className={`glass-effect p-8 md:p-12 transition-all duration-300 ${
            isDragging ? 'border-[#8B5CF6] border-2 scale-105' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#8B5CF6] blur-3xl opacity-30 animate-pulse-slow"></div>
                <Icon name="Upload" size={64} className="text-[#8B5CF6] relative z-10" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Загрузите ваш файл</h2>
              <p className="text-gray-400">Перетащите файл сюда или нажмите кнопку ниже</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90 transition-opacity text-lg px-8 py-6"
            >
              <Icon name="FolderOpen" size={20} className="mr-2" />
              Выбрать файл
            </Button>

            {file && (
              <div className="mt-4 p-4 bg-[#8B5CF6]/10 rounded-lg border border-[#8B5CF6]/30">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Icon name="Music" size={16} className="text-[#8B5CF6]" />
                  <span className="text-gray-300">{file.name}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {isProcessing && (
          <Card className="glass-effect p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Icon name="Loader2" size={24} className="text-[#8B5CF6] animate-spin" />
                <h3 className="text-xl font-semibold">Анализируем аудио...</h3>
              </div>
              
              <div className="flex justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-[#8B5CF6] to-[#D946EF] rounded-full animate-wave"
                    style={{
                      height: `${Math.random() * 60 + 20}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {notes.length > 0 && !isProcessing && (
          <>
            <Card className="glass-effect p-8">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="ListMusic" size={24} className="text-[#8B5CF6]" />
                <h3 className="text-2xl font-bold">Распознанные ноты</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-br from-[#8B5CF6]/20 to-[#D946EF]/20 rounded-xl border border-[#8B5CF6]/30 hover:border-[#8B5CF6] transition-all hover:scale-105"
                  >
                    <div className="text-3xl font-bold text-[#D946EF] mb-1">{note.name}</div>
                    <div className="text-xs text-gray-400">{note.frequency.toFixed(2)} Hz</div>
                    <div className="text-xs text-gray-500 mt-1">{note.timestamp}s</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-effect p-8">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="Piano" size={24} className="text-[#8B5CF6]" />
                <h3 className="text-2xl font-bold">Виртуальное пианино</h3>
              </div>
              
              <div className="flex justify-center gap-1 overflow-x-auto pb-4">
                {pianoKeys.map((key, idx) => {
                  const isBlackKey = key.includes('#');
                  const isActive = notes.some(note => note.name.startsWith(key));
                  
                  return (
                    <button
                      key={idx}
                      className={`
                        ${isBlackKey 
                          ? 'bg-gray-900 h-24 w-10 -mx-2 z-10 border-2 border-gray-800' 
                          : 'bg-white h-40 w-14 border-2 border-gray-300'
                        }
                        ${isActive ? 'ring-4 ring-[#8B5CF6]' : ''}
                        rounded-b-lg transition-all hover:scale-105 relative
                      `}
                    >
                      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs ${isBlackKey ? 'text-white' : 'text-gray-600'}`}>
                        {key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {audioUrl && (
              <Card className="glass-effect p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Headphones" size={20} className="text-[#8B5CF6]" />
                  <h4 className="font-semibold">Прослушать оригинал</h4>
                </div>
                <audio controls className="w-full" src={audioUrl}>
                  Ваш браузер не поддерживает аудио элемент.
                </audio>
              </Card>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90"
              >
                <Icon name="Download" size={20} className="mr-2" />
                Скачать ноты (PDF)
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              >
                <Icon name="Share2" size={20} className="mr-2" />
                Поделиться
              </Button>
            </div>
          </>
        )}

        {!file && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-effect p-6 hover:border-[#8B5CF6] transition-all">
              <Icon name="Wand2" size={32} className="text-[#8B5CF6] mb-4" />
              <h3 className="text-xl font-bold mb-2">Точное распознавание</h3>
              <p className="text-gray-400 text-sm">Высокая точность определения нот и аккордов для всех инструментов</p>
            </Card>
            
            <Card className="glass-effect p-6 hover:border-[#8B5CF6] transition-all">
              <Icon name="Zap" size={32} className="text-[#8B5CF6] mb-4" />
              <h3 className="text-xl font-bold mb-2">Быстрая обработка</h3>
              <p className="text-gray-400 text-sm">Мгновенный анализ и конвертация в ноты любого формата</p>
            </Card>
            
            <Card className="glass-effect p-6 hover:border-[#8B5CF6] transition-all">
              <Icon name="FileMusic" size={32} className="text-[#8B5CF6] mb-4" />
              <h3 className="text-xl font-bold mb-2">Экспорт в разные форматы</h3>
              <p className="text-gray-400 text-sm">Сохраняйте результат в PDF, MIDI или MusicXML</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
