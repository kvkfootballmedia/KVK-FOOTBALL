import { useState } from 'react';
import {
  MessageCircle, Facebook, Twitter, Copy, Mail, Check,
} from 'lucide-react';

interface ShareButtonsKVKProps {
  title: string;
  slug: string;
  excerpt?: string;
}

export default function ShareButtonsKVK({
  title,
  slug,
  excerpt,
}: ShareButtonsKVKProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Build the article URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kvkfootball.com';
  const articleUrl = `${baseUrl}/article/${slug}`;
  const shareText = `${title} - KVK Football`;
  const description = excerpt || 'Découvrez cet article sur KVK Football';

  // Share via WhatsApp
  const shareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${articleUrl}`)}`;
    window.open(whatsappUrl, 'whatsapp', 'width=500,height=600');
  };

  // Share via Facebook
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(facebookUrl, 'facebook', 'width=600,height=600');
  };

  // Share via Twitter/X
  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}&via=KVKFootball`;
    window.open(twitterUrl, 'twitter', 'width=550,height=420');
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Share via Email
  const shareEmail = () => {
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(`${description}\n\n${articleUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, 'email');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* WhatsApp */}
      <button
        onClick={shareWhatsApp}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium text-sm"
        title="Partager sur WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      {/* Facebook */}
      <button
        onClick={shareFacebook}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
        title="Partager sur Facebook"
      >
        <Facebook className="w-4 h-4" />
        <span className="hidden sm:inline">Facebook</span>
      </button>

      {/* Twitter/X */}
      <button
        onClick={shareTwitter}
        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition font-medium text-sm"
        title="Partager sur Twitter"
      >
        <Twitter className="w-4 h-4" />
        <span className="hidden sm:inline">Twitter</span>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${
          copiedToClipboard
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
        title="Copier le lien"
      >
        {copiedToClipboard ? (
          <>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Copié!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copier</span>
          </>
        )}
      </button>

      {/* Email */}
      <button
        onClick={shareEmail}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium text-sm"
        title="Partager par email"
      >
        <Mail className="w-4 h-4" />
        <span className="hidden sm:inline">Email</span>
      </button>
    </div>
  );
}
