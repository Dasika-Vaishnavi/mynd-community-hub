import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, GraduationCap, Clock, Award, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TherapistData {
  name: string;
  photo: string;
  specialties: string[];
  cost: number;
  slots: number;
  rating: number;
  bio?: string;
  credentials?: string;
  experience?: string;
  approaches?: string[];
  languages?: string[];
  location?: string;
}

interface TherapistProfileDialogProps {
  therapist: TherapistData | null;
  open: boolean;
  onClose: () => void;
  onBookSession: () => void;
}

export const TherapistProfileDialog = ({ therapist, open, onClose, onBookSession }: TherapistProfileDialogProps) => {
  if (!therapist) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0 rounded-3xl border-border">
        {/* Hero Header */}
        <div className="relative h-36 gradient-primary rounded-t-3xl">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden shadow-elevated">
              <img src={therapist.photo} alt={therapist.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="pt-14 pb-6 px-6">
          {/* Name & Rating */}
          <div className="text-center mb-4">
            <h2 className="font-display font-bold text-xl text-foreground">{therapist.name}</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star size={14} className="fill-warning text-warning" />
              <span className="text-sm font-mono text-foreground">{therapist.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">• {therapist.slots} slots available</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-5">
            {therapist.specialties.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {s}
              </span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 rounded-2xl bg-muted/50">
              <p className="font-mono font-bold text-foreground text-lg">${therapist.cost}</p>
              <p className="text-[10px] text-muted-foreground">per session</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-muted/50">
              <p className="font-mono font-bold text-foreground text-lg">{therapist.experience || "8yr"}</p>
              <p className="text-[10px] text-muted-foreground">experience</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-muted/50">
              <p className="font-mono font-bold text-foreground text-lg">500+</p>
              <p className="text-[10px] text-muted-foreground">sessions</p>
            </div>
          </div>

          {/* About */}
          <div className="mb-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <Heart size={14} className="text-accent" /> About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {therapist.bio || `${therapist.name} is a dedicated mental health professional committed to creating a safe, non-judgmental space for healing and growth. With a warm, evidence-based approach, they help clients navigate life's challenges with resilience and self-compassion.`}
            </p>
          </div>

          {/* Credentials */}
          <div className="mb-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-primary" /> Credentials
            </h3>
            <p className="text-sm text-muted-foreground">
              {therapist.credentials || "Licensed Mental Health Professional • Master's in Clinical Psychology • Board Certified"}
            </p>
          </div>

          {/* Approaches */}
          <div className="mb-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <Award size={14} className="text-secondary" /> Therapeutic Approaches
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(therapist.approaches || ["CBT", "Mindfulness-Based", "Solution-Focused", "Psychodynamic"]).map(a => (
                <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Location & Languages */}
          <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {therapist.location || "Remote & In-person"}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={13} /> {(therapist.languages || ["English"]).join(", ")}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onBookSession}
              className="flex-1 gradient-primary text-primary-foreground rounded-xl py-3 font-display font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Clock size={16} />
              Book Session — ${therapist.cost}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
