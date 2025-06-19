import {
    CalendarCheck,
    MapPin,
    Bell,
    Users,
    ShieldCheck,
    Stars,
    Ticket,
    Search
  } from 'lucide-react';
  
  export const features = [
    {
      title: 'Detailed Event & Venue Info',
      description:
        'Dive deep into event vibes. From what’s happening, how much it costs, to accessibility and real reviews—you’ll know it all before you commit.',
      icon: <Search className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Location-Based Discovery',
      description:
        'Where’s the party? 🔍 With real-time maps and GPS magic, discover exciting events near you. Who knows? The next big thing could be down the street!',
      icon: <MapPin className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Real-Time Event Updates',
      description:
        'No more surprises (unless it’s a flash mob). Get instant notifications about changes, ticket drops, or last-minute goodies!',
      icon: <Bell className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Social Community Features',
      description:
        'Events are better with your crew! See who’s going, join the hype, and maybe even make new friends who vibe like you.',
      icon: <Users className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Trust & Transparency',
      description:
        'Scam-free zone 🔒. We serve you verified info, genuine reviews, and official details—so you can book with confidence.',
      icon: <ShieldCheck className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Event Recommendations',
      description:
        'It’s like having a personal event planner. The more you explore, the smarter it gets—tailored picks you’ll actually want to go to.',
      icon: <Stars className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Easy Event Booking',
      description:
        'Two clicks, and you’re in 🎟️. Reserve your spot and get instant confirmation. That’s one less thing to worry about.',
      icon: <Ticket className="w-8 h-8 mb-4" />,
    },
    {
      title: 'Schedule Management',
      description:
        'Be your own time wizard 🧙. View, edit, and plan your entire event calendar in one sleek place—no overlaps, no double bookings.',
      icon: <CalendarCheck className="w-8 h-8 mb-4" />,
    },
  ];
  