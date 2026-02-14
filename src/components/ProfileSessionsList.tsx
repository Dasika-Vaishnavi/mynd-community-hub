import { Calendar, Clock, Video } from "lucide-react";

// Sessions aren't stored in DB yet — show mock history
const MOCK_SESSIONS = [
  {
    id: "s1",
    therapist: "Dr. Sarah Chen",
    specialty: "CBT & Anxiety",
    date: "Feb 12, 2026",
    time: "2:00 PM",
    duration: "50 min",
    status: "completed" as const,
  },
  {
    id: "s2",
    therapist: "Dr. James Rivera",
    specialty: "Mindfulness",
    date: "Feb 5, 2026",
    time: "10:30 AM",
    duration: "50 min",
    status: "completed" as const,
  },
  {
    id: "s3",
    therapist: "Dr. Sarah Chen",
    specialty: "CBT & Anxiety",
    date: "Jan 29, 2026",
    time: "2:00 PM",
    duration: "50 min",
    status: "completed" as const,
  },
  {
    id: "s4",
    therapist: "Dr. Priya Kapoor",
    specialty: "Trauma & EMDR",
    date: "Feb 18, 2026",
    time: "11:00 AM",
    duration: "50 min",
    status: "upcoming" as const,
  },
];

const statusStyles = {
  completed: "bg-success/15 text-success-foreground",
  upcoming: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

export const ProfileSessionsList = () => {
  const upcoming = MOCK_SESSIONS.filter((s) => s.status === "upcoming");
  const past = MOCK_SESSIONS.filter((s) => s.status !== "upcoming");

  if (MOCK_SESSIONS.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No sessions yet</p>
        <p className="text-xs text-muted-foreground mt-1">Book a session in Therapy Connect</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {upcoming.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-primary" />
            Upcoming
          </h4>
          <div className="space-y-3">
            {upcoming.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-sm text-muted-foreground mb-3">Past Sessions</h4>
          <div className="space-y-3">
            {past.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SessionCard = ({ session }: { session: (typeof MOCK_SESSIONS)[number] }) => (
  <div className="bg-card rounded-2xl shadow-soft p-4 flex items-center gap-4 hover:shadow-card transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Video size={18} className="text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-display font-bold text-sm text-foreground">{session.therapist}</p>
      <p className="text-xs text-muted-foreground">{session.specialty}</p>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <Calendar size={11} />
        <span>{session.date}</span>
        <span>·</span>
        <Clock size={11} />
        <span>{session.time}</span>
        <span>· {session.duration}</span>
      </div>
    </div>
    <span className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[session.status]}`}>
      {session.status}
    </span>
  </div>
);
