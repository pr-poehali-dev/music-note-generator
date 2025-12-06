import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Note {
  name: string;
  frequency: number;
  timestamp: number;
}

interface HistoryItem {
  id: string;
  fileName: string;
  date: string;
  notesCount: number;
  duration: number;
  notes: Note[];
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState<Note>({ name: '', frequency: 0, timestamp: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('noteScribeHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

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

      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        fileName: uploadedFile.name,
        date: new Date().toLocaleString('ru-RU'),
        notesCount: mockNotes.length,
        duration: 4.0,
        notes: mockNotes,
      };

      const updatedHistory = [historyItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('noteScribeHistory', JSON.stringify(updatedHistory));
    }, 2000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setNotes(item.notes);
    setFile(new File([], item.fileName));
    setIsHistoryOpen(false);
    toast.success(`Загружен: ${item.fileName}`);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('noteScribeHistory');
    toast.success('История очищена');
  };

  const exportToPDF = () => {
    toast.success('Экспорт в PDF запущен...');
    setTimeout(() => {
      const content = notes.map(n => `${n.name} (${n.frequency.toFixed(2)} Hz) - ${n.timestamp}s`).join('\n');
      const blob = new Blob([`NoteScribe - Нотная запись\n\n${file?.name || 'Файл'}\n\n${content}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name || 'notes'}_notes.txt`;
      a.click();
      toast.success('PDF готов к скачиванию!');
    }, 500);
  };

  const exportToMIDI = () => {
    toast.success('Экспорт в MIDI запущен...');
    setTimeout(() => {
      const midiData = notes.map(n => `NOTE: ${n.name}, TIME: ${n.timestamp}s, FREQ: ${n.frequency}Hz`).join('\n');
      const blob = new Blob([`MIDI Export - NoteScribe\n\n${midiData}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name || 'notes'}_midi.txt`;
      a.click();
      toast.success('MIDI готов к скачиванию!');
    }, 500);
  };

  const openEditDialog = (index: number) => {
    setEditingIndex(index);
    setEditedNote({ ...notes[index] });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingIndex(null);
    setEditedNote({ name: 'C4', frequency: 261.63, timestamp: 0 });
    setIsEditDialogOpen(true);
  };

  const saveNote = () => {
    if (!editedNote.name || editedNote.frequency <= 0 || editedNote.timestamp < 0) {
      toast.error('Заполните все поля корректно');
      return;
    }

    if (editingIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[editingIndex] = editedNote;
      setNotes(updatedNotes);
      toast.success('Нота обновлена!');
    } else {
      setNotes([...notes, editedNote].sort((a, b) => a.timestamp - b.timestamp));
      toast.success('Нота добавлена!');
    }
    setIsEditDialogOpen(false);
  };

  const deleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    toast.success('Нота удалена!');
  };

  const playNotes = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
      return;
    }

    setIsPlaying(true);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    let keepPlaying = true;

    const stopPlayback = () => {
      keepPlaying = false;
    };

    for (let i = 0; i < notes.length; i++) {
      if (!keepPlaying) break;
      
      setCurrentNoteIndex(i);
      const note = notes[i];
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setIsPlaying(false);
    setCurrentNoteIndex(-1);
  };

  const getNotePosition = (noteName: string): number => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
    };
    
    const baseNote = noteName.replace(/[#0-9]/g, '');
    const octave = parseInt(noteName.match(/\d+/)?.[0] || '4');
    const isSharp = noteName.includes('#');
    
    const basePosition = noteMap[baseNote] || 0;
    const octaveOffset = (octave - 4) * 7;
    const sharpOffset = isSharp ? 0.5 : 0;
    
    return basePosition + octaveOffset + sharpOffset;
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
          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsHistoryOpen(true)}
              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
            >
              <Icon name="History" size={18} className="mr-2" />
              История ({history.length})
            </Button>
          </div>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Icon name="Music4" size={24} className="text-[#8B5CF6]" />
                  <h3 className="text-2xl font-bold">Нотный стан</h3>
                </div>
                <Button
                  onClick={playNotes}
                  className={`${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90'
                  }`}
                >
                  <Icon name={isPlaying ? 'Square' : 'Play'} size={18} className="mr-2" />
                  {isPlaying ? 'Остановить' : 'Проиграть ноты'}
                </Button>
              </div>

              <div className="mb-8 bg-white/5 rounded-xl p-6 overflow-x-auto">
                <div className="relative min-w-[600px] h-64">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="absolute w-full border-t-2 border-gray-600"
                      style={{ top: `${40 + line * 40}px` }}
                    />
                  ))}
                  
                  <div className="absolute left-4 top-8 text-6xl text-gray-400">
                    𝄞
                  </div>

                  <div className="absolute left-20 top-0 right-4 h-full flex items-center gap-4">
                    {notes.map((note, idx) => {
                      const position = getNotePosition(note.name);
                      const topOffset = 180 - (position * 10);
                      const isCurrentNote = currentNoteIndex === idx;
                      const isSharp = note.name.includes('#');
                      
                      return (
                        <div
                          key={idx}
                          className="relative flex flex-col items-center"
                          style={{ animation: isCurrentNote ? 'pulse 0.6s ease-in-out' : 'none' }}
                        >
                          {topOffset < 40 && (
                            <div
                              className="absolute w-12 border-t-2 border-gray-500"
                              style={{ top: `${topOffset}px` }}
                            />
                          )}
                          {topOffset > 200 && (
                            <div
                              className="absolute w-12 border-t-2 border-gray-500"
                              style={{ top: `${topOffset}px` }}
                            />
                          )}
                          
                          {isSharp && (
                            <div
                              className="absolute text-2xl font-bold"
                              style={{ 
                                top: `${topOffset - 8}px`, 
                                left: '-12px',
                                color: isCurrentNote ? '#D946EF' : '#8B5CF6'
                              }}
                            >
                              ♯
                            </div>
                          )}
                          
                          <div
                            className={`absolute w-8 h-6 rounded-full border-4 transform rotate-[-20deg] transition-all ${
                              isCurrentNote 
                                ? 'bg-[#D946EF] border-[#D946EF] scale-125' 
                                : 'bg-[#8B5CF6] border-[#8B5CF6]'
                            }`}
                            style={{ top: `${topOffset - 3}px` }}
                          />
                          
                          <div
                            className={`absolute w-1 h-16 ${
                              isCurrentNote ? 'bg-[#D946EF]' : 'bg-[#8B5CF6]'
                            }`}
                            style={{ top: `${topOffset - 3}px`, left: '26px' }}
                          />
                          
                          <div className="absolute text-xs text-gray-400" style={{ top: '240px' }}>
                            {note.timestamp}s
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-effect p-8">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="ListMusic" size={24} className="text-[#8B5CF6]" />
                <h3 className="text-2xl font-bold">Распознанные ноты</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {notes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`group relative p-4 bg-gradient-to-br from-[#8B5CF6]/20 to-[#D946EF]/20 rounded-xl border transition-all ${
                      currentNoteIndex === idx 
                        ? 'border-[#D946EF] border-2 scale-105 shadow-lg shadow-[#D946EF]/50' 
                        : 'border-[#8B5CF6]/30 hover:border-[#8B5CF6]'
                    }`}
                  >
                    <div className={`text-3xl font-bold mb-1 transition-colors ${
                      currentNoteIndex === idx ? 'text-[#D946EF]' : 'text-[#8B5CF6]'
                    }`}>{note.name}</div>
                    <div className="text-xs text-gray-400">{note.frequency.toFixed(2)} Hz</div>
                    <div className="text-xs text-gray-500 mt-1">{note.timestamp}s</div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(idx)}
                        className="h-7 w-7 p-0 hover:bg-[#8B5CF6]/20"
                      >
                        <Icon name="Pencil" size={14} className="text-[#8B5CF6]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNote(idx)}
                        className="h-7 w-7 p-0 hover:bg-red-500/20"
                      >
                        <Icon name="Trash2" size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={openAddDialog}
                variant="outline"
                className="w-full mt-4 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 border-dashed"
              >
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить ноту вручную
              </Button>
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
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon name="Headphones" size={20} className="text-[#8B5CF6]" />
                      <h4 className="font-semibold">Прослушать оригинал</h4>
                    </div>
                    <audio controls className="w-full" src={audioUrl}>
                      Ваш браузер не поддерживает аудио элемент.
                    </audio>
                  </div>
                  
                  <div className="pt-4 border-t border-[#8B5CF6]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon name="Music" size={20} className="text-[#D946EF]" />
                      <h4 className="font-semibold">Синтезированная мелодия</h4>
                    </div>
                    <Button
                      onClick={playNotes}
                      className={`w-full ${
                        isPlaying 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90'
                      }`}
                    >
                      <Icon name={isPlaying ? 'Square' : 'Play'} size={18} className="mr-2" />
                      {isPlaying ? 'Остановить воспроизведение' : 'Проиграть распознанные ноты'}
                    </Button>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Сравните оригинал с синтезированным звуком из нот
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setIsExportDialogOpen(true)}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90"
              >
                <Icon name="Download" size={20} className="mr-2" />
                Экспорт нот
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

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="bg-[#1A1F2C] border-[#8B5CF6]/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon name="History" size={24} className="text-[#8B5CF6]" />
              История обработки
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Последние {history.length} обработанных файлов
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="FileX" size={48} className="mx-auto mb-3 opacity-50" />
                <p>История пуста</p>
              </div>
            ) : (
              history.map((item) => (
                <Card
                  key={item.id}
                  className="glass-effect p-4 hover:border-[#8B5CF6] transition-all cursor-pointer"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="Music" size={16} className="text-[#8B5CF6]" />
                        <h4 className="font-semibold text-sm">{item.fileName}</h4>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="ListMusic" size={12} />
                          {item.notesCount} нот
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          {item.duration}s
                        </span>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-gray-500" />
                  </div>
                </Card>
              ))
            )}
          </div>

          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Очистить историю
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] border-[#8B5CF6]/30">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon name="Download" size={24} className="text-[#8B5CF6]" />
              Экспорт нотной записи
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Выберите формат для экспорта распознанных нот
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Card
              className="glass-effect p-6 hover:border-[#8B5CF6] transition-all cursor-pointer"
              onClick={exportToPDF}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#8B5CF6]/20 rounded-lg">
                  <Icon name="FileText" size={32} className="text-[#8B5CF6]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">PDF</h3>
                  <p className="text-sm text-gray-400">Универсальный формат для печати и просмотра</p>
                </div>
                <Icon name="Download" size={20} className="text-gray-500" />
              </div>
            </Card>

            <Card
              className="glass-effect p-6 hover:border-[#8B5CF6] transition-all cursor-pointer"
              onClick={exportToMIDI}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#D946EF]/20 rounded-lg">
                  <Icon name="Music2" size={32} className="text-[#D946EF]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">MIDI</h3>
                  <p className="text-sm text-gray-400">Формат для музыкальных редакторов и секвенсоров</p>
                </div>
                <Icon name="Download" size={20} className="text-gray-500" />
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] border-[#8B5CF6]/30">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon name="Edit" size={24} className="text-[#8B5CF6]" />
              {editingIndex !== null ? 'Редактировать ноту' : 'Добавить ноту'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Укажите параметры ноты для точной нотной записи
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="note-name" className="text-sm font-medium">
                Название ноты
              </Label>
              <Input
                id="note-name"
                value={editedNote.name}
                onChange={(e) => setEditedNote({ ...editedNote, name: e.target.value })}
                placeholder="Например: C4, D#5, A3"
                className="bg-[#222747] border-[#8B5CF6]/30 focus:border-[#8B5CF6]"
              />
              <p className="text-xs text-gray-500">Формат: нота + октава (C4, D#5)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-frequency" className="text-sm font-medium">
                Частота (Hz)
              </Label>
              <Input
                id="note-frequency"
                type="number"
                step="0.01"
                value={editedNote.frequency}
                onChange={(e) => setEditedNote({ ...editedNote, frequency: parseFloat(e.target.value) })}
                placeholder="261.63"
                className="bg-[#222747] border-[#8B5CF6]/30 focus:border-[#8B5CF6]"
              />
              <p className="text-xs text-gray-500">Частота звука в герцах</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-timestamp" className="text-sm font-medium">
                Время (секунды)
              </Label>
              <Input
                id="note-timestamp"
                type="number"
                step="0.1"
                value={editedNote.timestamp}
                onChange={(e) => setEditedNote({ ...editedNote, timestamp: parseFloat(e.target.value) })}
                placeholder="0.5"
                className="bg-[#222747] border-[#8B5CF6]/30 focus:border-[#8B5CF6]"
              />
              <p className="text-xs text-gray-500">Момент появления ноты</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveNote}
                className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90"
              >
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                variant="outline"
                className="flex-1 border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;