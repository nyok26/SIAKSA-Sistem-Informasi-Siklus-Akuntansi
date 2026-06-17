import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageProvider';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className={className}>
      <Select value={locale} onValueChange={(v) => setLocale(v as 'en' | 'id')}>
        <SelectTrigger className="w-40 text-sm">
          <SelectValue placeholder={t('language.label')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('language.english')}</SelectItem>
          <SelectItem value="id">{t('language.indonesian')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default LanguageSwitcher;
