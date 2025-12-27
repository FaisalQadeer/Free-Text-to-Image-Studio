
import React from 'react';
import { GeneratedImage } from '../types';
import { Download, Heart, Trash2, Edit3 } from 'lucide-react';

interface ImageCardProps {
  image: GeneratedImage;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (image: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  onDelete, 
  onToggleFavorite,
  onEdit
}) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `lumina-art-${image.id}.png`;
    link.click();
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden glass animate-fade-in transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
      <img 
        src={image.url} 
        alt={image.prompt} 
        className="w-full h-auto aspect-square object-cover"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-sm text-white/90 line-clamp-2 mb-3 italic">
          "{image.prompt}"
        </p>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleFavorite(image.id)}
              className={`p-2 rounded-full glass hover:bg-white/20 transition-colors ${image.isFavorite ? 'text-pink-500' : 'text-white'}`}
              title="Favorite"
            >
              <Heart className="w-4 h-4" fill={image.isFavorite ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={downloadImage}
              className="p-2 rounded-full glass hover:bg-white/20 transition-colors text-white"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onEdit(image)}
              className="p-2 rounded-full glass hover:bg-white/20 transition-colors text-white"
              title="Edit with AI"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => onDelete(image.id)}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {image.type === 'edit' && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500/80 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider">
          Modified
        </div>
      )}
    </div>
  );
};
