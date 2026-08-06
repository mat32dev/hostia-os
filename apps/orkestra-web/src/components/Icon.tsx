import {
  Building2,
  Car,
  GraduationCap,
  Landmark,
  Layers,
  MessageCircle,
  Phone,
  Plane,
  Receipt,
  Server,
  Shield,
  Signal,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Truck,
} from 'lucide-react';

const map: Record<string, React.ComponentType<{ className?: string }>> = {
  'building': Building2,
  'car': Car,
  'graduation-cap': GraduationCap,
  'landmark': Landmark,
  'layers': Layers,
  'message-circle': MessageCircle,
  'phone': Phone,
  'plane': Plane,
  'receipt': Receipt,
  'server': Server,
  'shield': Shield,
  'signal': Signal,
  'shopping-bag': ShoppingBag,
  'sparkles': Sparkles,
  'stethoscope': Stethoscope,
  'truck': Truck,
};

export default function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = map[name] ?? Sparkles;
  return <Cmp className={className} />;
}
