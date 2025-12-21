import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-switcher">
      <Globe className="language-icon" />
      <div className="language-buttons">
        <button
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'lang-btn active' : 'lang-btn'}
          aria-label={t.english}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('cs')}
          className={language === 'cs' ? 'lang-btn active' : 'lang-btn'}
          aria-label={t.czech}
        >
          CZ
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
