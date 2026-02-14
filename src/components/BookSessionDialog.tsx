import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Clock, CheckCircle2, ArrowLeft, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface TherapistData {
  name: string;
  photo: string;
  specialties: string[];
  cost: number;
  slots: number;
  rating: number;
}

interface BookSessionDialogProps {
  therapist: TherapistData | null;
  open: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
];

// Simulate some slots being taken
const getAvailableSlots = (date: Date) => {
  const seed = date.getDate() + date.getMonth() * 31;
  return TIME_SLOTS.filter((_, i) => (seed + i * 7) % 3 !== 0);
};

type Step = 'date' | 'time' | 'confirm' | 'success';

export const BookSessionDialog = ({ therapist, open, onClose }: BookSessionDialogProps) => {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableSlots(selectedDate);
  }, [selectedDate]);

  const handleClose = () => {
    setStep('date');
    setSelectedDate(undefined);
    setSelectedTime(null);
    onClose();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('success');
    toast({
      title: "Session Booked! 🎉",
      description: `Your session with ${therapist?.name} is confirmed.`,
    });
  };

  if (!therapist) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 rounded-3xl border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step !== 'date' && step !== 'success' && (
              <button
                onClick={() => setStep(step === 'confirm' ? 'time' : 'date')}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft size={16} className="text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/30">
                <img src={therapist.photo} alt={therapist.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-sm">{therapist.name}</h3>
                <div className="flex items-center gap-1">
                  <Star size={10} className="fill-warning text-warning" />
                  <span className="text-xs text-muted-foreground">{therapist.rating} • ${therapist.cost}/session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1 mt-4">
            {(['date', 'time', 'confirm'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  (['date', 'time', 'confirm', 'success'].indexOf(step) >= i)
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {step === 'date' && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-muted-foreground mb-3 mt-4">Select a date</p>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isBefore(date, startOfDay(new Date())) || isBefore(addDays(new Date(), 30), date)}
                  className={cn("p-3 pointer-events-auto rounded-2xl border border-border")}
                />
              </motion.div>
            )}

            {step === 'time' && selectedDate && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-muted-foreground mb-1 mt-4">
                  Available times for <span className="font-medium text-foreground">{format(selectedDate, "EEEE, MMM d")}</span>
                </p>
                <p className="text-xs text-muted-foreground mb-3">{availableSlots.length} slots available</p>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                        selectedTime === time
                          ? "gradient-primary text-primary-foreground border-transparent"
                          : "border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <Clock size={12} className="inline mr-1" />
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'confirm' && selectedDate && selectedTime && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-4"
              >
                <p className="text-sm text-muted-foreground mb-4">Confirm your session</p>

                <div className="bg-muted/50 rounded-2xl p-4 mb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Therapist</span>
                    <span className="font-medium text-foreground">{therapist.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">50 minutes</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Total</span>
                    <span className="font-bold text-foreground font-mono">${therapist.cost}.00</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-display font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Confirm Booking — ${therapist.cost}
                </button>
              </motion.div>
            )}

            {step === 'success' && selectedDate && selectedTime && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 size={32} className="text-success" />
                </motion.div>
                <h3 className="font-display font-bold text-lg text-foreground mb-1">Session Booked!</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {format(selectedDate, "EEEE, MMM d")} at {selectedTime}
                </p>
                <p className="text-sm text-muted-foreground mb-5">with {therapist.name}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  You'll receive a confirmation email with session details and a video call link.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-muted text-foreground font-display font-semibold text-sm hover:bg-muted/80 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
