import { Eye, Navigation, ShieldCheck, FileText, Info, Compass, CalendarDays, BookOpen, Settings, Archive, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const SECTION_ICONS = {
  Awareness: Eye,
  Alignment: Navigation,
  Integrity: ShieldCheck,
  Reflection: FileText,
} as const;

const HOME_CARD_ICONS = {
  'What this system does (and doesn\'t)': Info,
  'Why this system exists': Compass,
  'What to expect over 30 days': CalendarDays,
  'Definitions': BookOpen,
} as const;

type SectionName = keyof typeof SECTION_ICONS;
type HomeCardName = keyof typeof HOME_CARD_ICONS;

interface SectionIconProps {
  name: SectionName;
  className?: string;
}

interface HomeCardIconProps {
  name: HomeCardName;
  className?: string;
}

export function SectionIcon({ name, className = '' }: SectionIconProps) {
  const Icon = SECTION_ICONS[name];
  return <Icon size={18} className={className} aria-hidden="true" style={{ color: 'currentColor' }} />;
}

export function HomeCardIcon({ name, className = '' }: HomeCardIconProps) {
  const Icon = HOME_CARD_ICONS[name];
  return <Icon size={18} className={className} aria-hidden="true" style={{ color: 'currentColor' }} />;
}

export const HeaderIcons = {
  Settings,
  Archive,
  Review: FileText,
  Back: ArrowLeft,
  ChevronDown,
  ChevronUp,
};

export { SECTION_ICONS, HOME_CARD_ICONS };
