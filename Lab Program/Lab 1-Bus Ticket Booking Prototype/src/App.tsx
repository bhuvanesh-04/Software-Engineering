import { useMemo, useState } from "react";

type Page = "home" | "results" | "seats" | "passengers" | "review" | "payment" | "confirmation" | "bookings";
type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";
type Passenger = { name: string; age: string; gender: string };
type Bus = {
  id: number; operator: string; type: string; departure: string; arrival: string;
  duration: string; price: number; seats: number; rating: number; amenities: string[];
};

const locations = [
  "Chennai, Tamil Nadu", "Chennai Central", "Chennai Airport",
  "Bengaluru, Karnataka", "Bengaluru Airport", "Majestic, Bengaluru",
  "Hyderabad, Telangana", "Hyderabad Airport", "Mumbai, Maharashtra",
  "Pune, Maharashtra", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu",
  "Kochi, Kerala", "Delhi, NCR", "Goa, Goa",
];

const buses: Bus[] = [
  { id: 1, operator: "GreenLine Express", type: "AC Sleeper", departure: "21:30", arrival: "05:45", duration: "8h 15m", price: 799, seats: 18, rating: 4.8, amenities: ["WiFi", "Charging", "Live tracking"] },
  { id: 2, operator: "InterCity SmartBus", type: "Volvo/Multi-Axle", departure: "22:15", arrival: "06:15", duration: "8h 00m", price: 1099, seats: 8, rating: 4.6, amenities: ["Blanket", "Water", "GPS"] },
  { id: 3, operator: "Orange Travels", type: "AC Semi-Sleeper", departure: "18:45", arrival: "03:30", duration: "8h 45m", price: 649, seats: 24, rating: 4.4, amenities: ["Charging", "Reading light"] },
  { id: 4, operator: "KPN Roadways", type: "Non-AC Sleeper", departure: "20:00", arrival: "05:10", duration: "9h 10m", price: 579, seats: 13, rating: 4.2, amenities: ["Water", "Emergency exit"] },
  { id: 5, operator: "NueGo Electric", type: "AC Seater", departure: "07:00", arrival: "14:20", duration: "7h 20m", price: 699, seats: 31, rating: 4.7, amenities: ["WiFi", "Charging", "Snacks"] },
];

const boardingPoints = ["Majestic Bus Station · 20:45", "Silk Board · 21:15", "Electronic City · 21:40"];
const droppingPoints = ["Koyambedu CMBT · 05:45", "Guindy · 06:05", "Chennai Central · 06:25"];

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const dateLabel = (value: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Add date";

function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    bus: <><path d="M5 16V7c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v9M5 11h14M7 16h10M8 20v-2m8 2v-2M8 7h8" /><circle cx="8" cy="14" r=".7" fill="currentColor" /><circle cx="16" cy="14" r=".7" fill="currentColor" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4m8-4v4M3.5 9.5h17" /></>,
    swap: <path d="m8 7-3 3 3 3M5 10h13m-2 1 3 3-3 3M19 14H6" />,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    down: <path d="m6 9 6 6 6-6" />,
    close: <path d="m7 7 10 10M17 7 7 17" />,
    check: <path d="m5 12 4 4L19 6" />,
    filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
    shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-5" />,
    ticket: <><path d="M4 7a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V7Z" /><path d="M9 8v8m3-8h3m-3 4h3" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    wifi: <path d="M5 10a10 10 0 0 1 14 0M8 13a6 6 0 0 1 8 0m-5 4a1.5 1.5 0 1 1 2 0" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    edit: <path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10L4 20Zm10-12 3 3" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Header({ page, go }: { page: Page; go: (page: Page) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button className="flex items-center gap-2" onClick={() => go("home")} aria-label="GoBus home">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-brand"><Icon name="bus" className="size-6" /></span>
          <span className="text-xl font-extrabold tracking-tight">Go<span className="text-brand">Bus</span></span>
        </button>
        <nav className="hidden h-full items-center gap-8 text-sm font-bold md:flex" aria-label="Main navigation">
          <button className={page === "home" ? "nav-active" : "nav-link"} onClick={() => go("home")}>Home</button>
          <button className={page === "bookings" ? "nav-active" : "nav-link"} onClick={() => go("bookings")}>My Bookings</button>
          <button className="nav-link" onClick={() => alert("GoBus support is available 24×7 at 1800-00-GOBUS.")}>Help</button>
        </nav>
        <button className="secondary-button !rounded-full !px-4"><Icon name="user" className="size-4" /> <span className="hidden sm:inline">Login</span></button>
      </div>
    </header>
  );
}

function Progress({ step }: { step: number }) {
  const items = ["Search", "Seats", "Passengers", "Review", "Payment"];
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        {items.map((item, index) => (
          <div key={item} className="flex flex-1 items-center last:flex-none">
            <span className={`step-dot ${index <= step ? "step-active" : ""}`}>{index < step ? <Icon name="check" className="size-3.5" /> : index + 1}</span>
            <span className={`ml-2 hidden text-xs font-bold sm:inline ${index <= step ? "text-ink" : "text-muted"}`}>{item}</span>
            {index < items.length - 1 && <span className={`mx-3 h-px flex-1 ${index < step ? "bg-brand" : "bg-line"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const matches = value.trim()
    ? locations.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 5)
    : locations.filter((item) => [0, 3, 6, 8, 10].includes(locations.indexOf(item)));
  return (
    <div className="relative">
      <label className="search-field">
        <span className="field-label">{label}</span>
        <span className="flex items-center gap-3">
          <Icon name="pin" className="size-5 shrink-0 text-brand" />
          <input value={value} onChange={(e) => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={`Enter ${label.toLowerCase()}`} autoComplete="off" />
        </span>
      </label>
      {open && (
        <div className="suggestions">
          <p className="suggestion-title">{value.trim() ? "Matching locations" : "Popular destinations"}</p>
          {matches.length ? matches.map((item) => (
            <button key={item} className="suggestion-row" onMouseDown={() => { onChange(item); setOpen(false); }}>
              <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand"><Icon name="pin" className="size-4" /></span>
              <span><b>{item.split(",")[0]}</b>{item.includes(",") && <small>{item.substring(item.indexOf(","))}</small>}</span>
            </button>
          )) : <p className="px-4 py-5 text-sm text-muted">No locations found. Try another city.</p>}
        </div>
      )}
      {open && <button className="fixed inset-0 z-[-1] cursor-default" onClick={() => setOpen(false)} aria-label="Close suggestions" />}
    </div>
  );
}

function Calendar({ value, onClose, onApply }: { value: string; onClose: () => void; onApply: (value: string) => void }) {
  const initial = value ? new Date(`${value}T12:00:00`) : new Date();
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [picked, setPicked] = useState(value || todayISO());
  const firstDay = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + days }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  const toISO = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Choose date">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-modal">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="eyebrow">Choose journey date</p><h3 className="text-xl font-extrabold">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h3></div>
          <button className="icon-button" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="mb-4 flex justify-between">
          <button className="icon-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={month <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}><Icon name="back" /></button>
          <button className="icon-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Icon name="chevron" /></button>
        </div>
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <span key={d} className="calendar-weekday">{d.slice(0, 1)}</span>)}
          {cells.map((day, i) => day ? (
            <button key={i} disabled={toISO(day) < todayISO()} className={`calendar-day ${picked === toISO(day) ? "calendar-selected" : ""} ${toISO(day) === todayISO() ? "calendar-today" : ""}`} onClick={() => setPicked(toISO(day))}>{day}</button>
          ) : <span key={i} />)}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
          <span><small className="block text-muted">Selected</small><b>{dateLabel(picked)}</b></span>
          <button className="primary-button" onClick={() => onApply(picked)}>Apply date</button>
        </div>
      </div>
    </div>
  );
}

function Home({ from, to, setFrom, setTo, journeyDate, setJourneyDate, returnDate, setReturnDate, search }: {
  from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void;
  journeyDate: string; setJourneyDate: (v: string) => void; returnDate: string; setReturnDate: (v: string) => void; search: () => void;
}) {
  const [calendarFor, setCalendarFor] = useState<"journey" | "return" | null>(null);
  return (
    <>
      <section className="home-hero px-5 py-16 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">India is closer than you think</p>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">Where will your next <span className="text-brand">journey</span> take you?</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">Compare trusted bus operators, choose your seat, and travel with confidence.</p>
          </div>
          <div className="search-card">
            <div className="relative grid gap-3 lg:grid-cols-home-search">
              <div className="relative grid gap-3 sm:grid-cols-2 lg:col-span-2">
                <LocationField label="From" value={from} onChange={setFrom} />
                <button className="swap-button" onClick={() => { const current = from; setFrom(to); setTo(current); }} aria-label="Swap locations"><Icon name="swap" className="size-4" /></button>
                <LocationField label="To" value={to} onChange={setTo} />
              </div>
              <button className="search-field text-left" onClick={() => setCalendarFor("journey")}>
                <span className="field-label">Date of journey</span>
                <span className="flex items-center gap-3 font-extrabold"><Icon name="calendar" className="size-5 text-brand" />{dateLabel(journeyDate)}</span>
              </button>
              <button className="search-field text-left" onClick={() => setCalendarFor("return")}>
                <span className="field-label">Return date <i className="normal-case text-muted">(optional)</i></span>
                <span className={`flex items-center gap-3 font-extrabold ${returnDate ? "" : "text-muted"}`}><Icon name="calendar" className="size-5 text-brand" />{dateLabel(returnDate)}</span>
              </button>
              <button className="primary-button min-h-16" onClick={search}>Search buses <Icon name="search" className="size-5" /></button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[["shield", "Safe & verified", "Trusted operators"], ["ticket", "Flexible tickets", "Easy cancellation"], ["clock", "24×7 support", "We're always here"]].map(([icon, title, copy]) => (
              <div key={title} className="hero-benefit"><Icon name={icon} className="size-6 text-brand" /><span><b>{title}</b><small>{copy}</small></span></div>
            ))}
          </div>
        </div>
      </section>
      {calendarFor && <Calendar value={calendarFor === "journey" ? journeyDate : returnDate} onClose={() => setCalendarFor(null)} onApply={(value) => { calendarFor === "journey" ? setJourneyDate(value) : setReturnDate(value); setCalendarFor(null); }} />}
    </>
  );
}

function Results({ from, to, date, onBack, onSelect }: { from: string; to: string; date: string; onBack: () => void; onSelect: (bus: Bus) => void }) {
  const [types, setTypes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1200);
  const [minSeats, setMinSeats] = useState(false);
  const [departure, setDeparture] = useState("Any");
  const [arrival, setArrival] = useState("Any");
  const [operator, setOperator] = useState("All operators");
  const [sort, setSort] = useState("Recommended");
  const [mobileFilters, setMobileFilters] = useState(false);
  const toggleType = (type: string) => setTypes((x) => x.includes(type) ? x.filter((v) => v !== type) : [...x, type]);
  let filtered = buses.filter((b) => (!types.length || types.includes(b.type)) && b.price <= maxPrice && (!minSeats || b.seats >= 15) && (operator === "All operators" || b.operator === operator));
  if (departure === "Morning") filtered = filtered.filter((b) => Number(b.departure.slice(0, 2)) < 12);
  if (departure === "Evening") filtered = filtered.filter((b) => Number(b.departure.slice(0, 2)) >= 17);
  if (arrival === "Before 6") filtered = filtered.filter((b) => Number(b.arrival.slice(0, 2)) < 6);
  if (arrival === "After 6") filtered = filtered.filter((b) => Number(b.arrival.slice(0, 2)) >= 6);
  filtered = [...filtered].sort((a, b) => sort === "Price" ? a.price - b.price : sort === "Rating" ? b.rating - a.rating : sort === "Departure" ? a.departure.localeCompare(b.departure) : b.rating - a.rating);
  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h3 className="font-extrabold">Filters</h3><button className="text-xs font-bold text-brand" onClick={() => { setTypes([]); setMaxPrice(1200); setMinSeats(false); setDeparture("Any"); setArrival("Any"); setOperator("All operators"); }}>Clear all</button></div>
      <Filter title="Bus type">{["AC Sleeper", "Non-AC Sleeper", "AC Seater", "AC Semi-Sleeper", "Volvo/Multi-Axle"].map((type) => <Check key={type} checked={types.includes(type)} label={type} onChange={() => toggleType(type)} />)}</Filter>
      <Filter title="Departure time"><div className="grid grid-cols-3 gap-2">{["Any", "Morning", "Evening"].map((d) => <button key={d} className={departure === d ? "mini-chip-active" : "mini-chip"} onClick={() => setDeparture(d)}>{d}</button>)}</div></Filter>
      <Filter title={`Price up to ₹${maxPrice}`}><input className="range" type="range" min="600" max="1200" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /></Filter>
      <Filter title="Bus operator"><select className="select-control" value={operator} onChange={(e) => setOperator(e.target.value)}><option>All operators</option>{buses.map((b) => <option key={b.id}>{b.operator}</option>)}</select></Filter>
      <Filter title="Seat availability"><Check checked={minSeats} label="15+ seats available" onChange={() => setMinSeats(!minSeats)} /></Filter>
      <Filter title="Arrival time"><div className="grid grid-cols-3 gap-2">{["Any", "Before 6", "After 6"].map((a) => <button key={a} className={arrival === a ? "mini-chip-active" : "mini-chip"} onClick={() => setArrival(a)}>{a}</button>)}</div></Filter>
    </div>
  );
  return (
    <>
      <Progress step={0} />
      <div className="route-bar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3"><button className="icon-button" onClick={onBack}><Icon name="back" /></button><div><b>{from} <span className="text-brand">→</span> {to}</b><p className="text-xs text-muted">{dateLabel(date)}</p></div></div>
          <button className="secondary-button" onClick={onBack}><Icon name="edit" className="size-4" /> Change search</button>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div><p className="eyebrow">Choose your ride</p><h1 className="text-2xl font-extrabold">{filtered.length} buses available</h1></div>
          <button className="secondary-button lg:hidden" onClick={() => setMobileFilters(true)}><Icon name="filter" className="size-4" /> Filters</button>
        </div>
        <div className="grid gap-7 lg:grid-cols-results">
          <aside className="hidden rounded-2xl border border-line bg-white p-5 lg:block">{filterPanel}</aside>
          <section>
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {["Recommended", "Price", "Rating", "Departure"].map((item) => <button key={item} className={sort === item ? "filter-chip-active" : "filter-chip"} onClick={() => setSort(item)}>{item}</button>)}
            </div>
            <div className="space-y-4">
              {filtered.map((bus) => <BusCard key={bus.id} bus={bus} from={from} to={to} onSelect={() => onSelect(bus)} />)}
              {!filtered.length && <div className="empty-state"><Icon name="bus" className="size-10 text-brand" /><h3>No buses match these filters</h3><p>Try clearing a filter or increasing your price range.</p></div>}
            </div>
          </section>
        </div>
      </main>
      {mobileFilters && <div className="fixed inset-0 z-50 bg-ink/55"><aside className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-6"><div className="mb-6 flex justify-end"><button className="icon-button" onClick={() => setMobileFilters(false)}><Icon name="close" /></button></div>{filterPanel}<button className="primary-button mt-8 w-full" onClick={() => setMobileFilters(false)}>Show {filtered.length} buses</button></aside></div>}
    </>
  );
}

function Filter({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border-t border-line pt-5 first:border-0 first:pt-0"><p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">{title}</p><div className="space-y-2.5">{children}</div></div>;
}
function Check({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center gap-2.5 text-sm"><input className="accent-brand" type="checkbox" checked={checked} onChange={onChange} />{label}</label>;
}
function BusCard({ bus, from, to, onSelect }: { bus: Bus; from: string; to: string; onSelect: () => void }) {
  return (
    <article className="bus-card p-5 sm:p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
        <div className="min-w-56"><div className="mb-2 flex gap-2"><span className="badge-brand">GoBus choice</span><span className="badge-success">★ {bus.rating}</span></div><h2 className="text-lg font-extrabold">{bus.operator}</h2><p className="mt-1 text-sm text-muted">{bus.type}</p></div>
        <div className="flex flex-1 items-center gap-3"><div><b className="text-xl">{bus.departure}</b><small className="block text-muted">{from.split(",")[0]}</small></div><div className="route-line"><span>{bus.duration}</span></div><div className="text-right"><b className="text-xl">{bus.arrival}</b><small className="block text-muted">{to.split(",")[0]}</small></div></div>
        <div className="flex flex-wrap gap-2 xl:w-52">{bus.amenities.map((a) => <span key={a} className="amenity">{a}</span>)}</div>
        <div className="flex items-center justify-between gap-5 border-t border-line pt-5 xl:w-48 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><div><small className="text-muted">From</small><b className="block text-xl">₹{bus.price}</b><small className="font-bold text-success">{bus.seats} seats left</small></div><button className="primary-button" onClick={onSelect}>View seats</button></div>
      </div>
    </article>
  );
}

function SeatSelection({ bus, from, to, date, selected, setSelected, back, next }: { bus: Bus; from: string; to: string; date: string; selected: string[]; setSelected: (v: string[]) => void; back: () => void; next: () => void }) {
  const [deck, setDeck] = useState<"Lower" | "Upper">("Lower");
  const tax = Math.round(selected.length * bus.price * 0.05);
  const seats = Array.from({ length: 32 }, (_, i) => `${deck === "Lower" ? "L" : "U"}${i + 1}`);
  const state = (i: number) => i % 9 === 2 ? "booked" : i % 11 === 5 ? "female" : i % 13 === 7 ? "male" : "available";
  const toggle = (seat: string, status: string) => status !== "booked" && setSelected(selected.includes(seat) ? selected.filter((x) => x !== seat) : [...selected, seat]);
  return (
    <>
      <Progress step={1} /><PageTop back={back} title={bus.operator} subtitle={`${bus.type} · ${dateLabel(date)}`} />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Select your seats</p><h1 className="text-2xl font-extrabold">{from.split(",")[0]} → {to.split(",")[0]}</h1><p className="mt-1 text-sm text-muted">{bus.departure} – {bus.arrival} · {bus.duration}</p></div><div className="flex gap-2">{["Lower", "Upper"].map((d) => <button key={d} className={deck === d ? "filter-chip-active" : "filter-chip"} onClick={() => setDeck(d as "Lower" | "Upper")}>{d} deck</button>)}</div></div>
        <div className="grid gap-7 lg:grid-cols-seat-page">
          <section>
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted"><Legend color="bg-white" text="Available" /><Legend color="bg-brand" text="Selected" /><Legend color="bg-disabled" text="Booked" /><Legend color="bg-pink-100" text="Female only" /><Legend color="bg-blue-100" text="Male only" /></div>
            <div className="bus-shell">
              <div className="mb-6 flex items-center justify-between"><span className="text-xs font-bold text-muted">{deck.toUpperCase()} DECK</span><span className="grid size-10 place-items-center rounded-full border border-line text-muted">◯</span></div>
              <div className="seat-grid">
                {seats.map((seat, i) => {
                  const s = state(i); const chosen = selected.includes(seat);
                  return <button key={seat} disabled={s === "booked"} onClick={() => toggle(seat, s)} className={`seat ${chosen ? "seat-selected" : `seat-${s}`} ${i % 4 === 2 ? "col-start-4" : ""}`}><span>{seat}</span></button>;
                })}
              </div>
            </div>
          </section>
          <aside className="summary-card">
            <p className="eyebrow">Fare summary</p><h2 className="text-lg font-extrabold">{selected.length ? `${selected.length} seat${selected.length > 1 ? "s" : ""} selected` : "Select a seat to continue"}</h2>
            <div className="my-5 min-h-10">{selected.length ? <div className="flex flex-wrap gap-2">{selected.map((s) => <button key={s} className="selected-seat-chip" onClick={() => setSelected(selected.filter((x) => x !== s))}>{s} ×</button>)}</div> : <p className="text-sm text-muted">Available seats are shown in white.</p>}</div>
            <div className="space-y-3 border-y border-dashed border-line py-5 text-sm"><Line label="Base fare" value={`₹${selected.length * bus.price}`} /><Line label="Taxes & fees" value={`₹${tax}`} /></div>
            <div className="my-5 flex items-end justify-between"><span className="font-bold">Total amount</span><b className="text-2xl">₹{selected.length * bus.price + tax}</b></div>
            <button className="primary-button w-full" disabled={!selected.length} onClick={next}>Continue <Icon name="chevron" className="size-4" /></button>
          </aside>
        </div>
      </main>
    </>
  );
}
function Legend({ color, text }: { color: string; text: string }) { return <span className="flex items-center gap-1.5"><i className={`size-3 rounded border border-line ${color}`} />{text}</span>; }
function Line({ label, value }: { label: string; value: string }) { return <div className="flex justify-between"><span className="text-muted">{label}</span><b>{value}</b></div>; }
function PageTop({ back, title, subtitle }: { back: () => void; title: string; subtitle: string }) {
  return <div className="route-bar"><div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 lg:px-8"><button className="icon-button" onClick={back}><Icon name="back" /></button><div><b>{title}</b><p className="text-xs text-muted">{subtitle}</p></div></div></div>;
}

function PassengerDetails({ seats, passengers, setPassengers, mobile, setMobile, email, setEmail, boarding, setBoarding, dropping, setDropping, back, next }: {
  seats: string[]; passengers: Passenger[]; setPassengers: (v: Passenger[]) => void; mobile: string; setMobile: (v: string) => void; email: string; setEmail: (v: string) => void;
  boarding: string; setBoarding: (v: string) => void; dropping: string; setDropping: (v: string) => void; back: () => void; next: () => void;
}) {
  const update = (i: number, key: keyof Passenger, value: string) => setPassengers(passengers.map((p, x) => x === i ? { ...p, [key]: value } : p));
  const valid = passengers.length === seats.length && passengers.every((p) => p.name && p.age && p.gender) && mobile.length >= 10 && email.includes("@") && boarding && dropping;
  return (
    <>
      <Progress step={2} /><PageTop back={back} title="Passenger details" subtitle={`${seats.length} traveller${seats.length > 1 ? "s" : ""} · Seats ${seats.join(", ")}`} />
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-passengers">
          <section className="space-y-5">
            {seats.map((seat, i) => <div className="form-card" key={seat}><div className="mb-5 flex items-center justify-between"><h2 className="font-extrabold">Passenger {i + 1}</h2><span className="badge-brand">Seat {seat}</span></div><div className="form-grid"><Field label="Passenger name"><input value={passengers[i]?.name || ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="Full name" /></Field><Field label="Age"><input type="number" min="1" max="100" value={passengers[i]?.age || ""} onChange={(e) => update(i, "age", e.target.value)} placeholder="Age" /></Field><Field label="Gender"><select value={passengers[i]?.gender || ""} onChange={(e) => update(i, "gender", e.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></Field></div></div>)}
            <div className="form-card"><h2 className="mb-5 font-extrabold">Contact details</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Mobile number"><input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" /></Field><Field label="Email address"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field></div><p className="mt-3 text-xs text-muted">Your ticket and journey updates will be sent here.</p></div>
          </section>
          <aside className="summary-card h-fit"><p className="eyebrow">Boarding & dropping</p><h2 className="mb-5 text-lg font-extrabold">Choose your stops</h2><div className="space-y-4"><Field label="Boarding point"><select value={boarding} onChange={(e) => setBoarding(e.target.value)}><option value="">Select pickup location</option>{boardingPoints.map((p) => <option key={p}>{p}</option>)}</select></Field><Field label="Dropping point"><select value={dropping} onChange={(e) => setDropping(e.target.value)}><option value="">Select drop location</option>{droppingPoints.map((p) => <option key={p}>{p}</option>)}</select></Field></div>{boarding && <div className="mt-5 rounded-xl bg-panel p-3 text-xs"><b>Pickup location</b><p className="mt-1 text-muted">Main entrance, opposite Metro gate. Arrive 15 min early.</p></div>}<button className="primary-button mt-6 w-full" disabled={!valid} onClick={next}>Review booking <Icon name="chevron" className="size-4" /></button></aside>
        </div>
      </main>
    </>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }

function Review({ bus, from, to, date, seats, passengers, boarding, dropping, total, editSeats, editPassengers, editJourney, next, back }: {
  bus: Bus; from: string; to: string; date: string; seats: string[]; passengers: Passenger[]; boarding: string; dropping: string; total: number;
  editSeats: () => void; editPassengers: () => void; editJourney: () => void; next: () => void; back: () => void;
}) {
  const tax = total - seats.length * bus.price;
  return (
    <>
      <Progress step={3} /><PageTop back={back} title="Review your booking" subtitle="Check all details before payment" />
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-review">
          <section className="space-y-5">
            <ReviewCard title="Journey" edit="Edit journey" onEdit={editJourney}><div className="flex items-center justify-between gap-4"><div><small>FROM</small><h3>{from}</h3><b>{bus.departure}</b></div><div className="route-line"><span>{bus.duration}</span></div><div className="text-right"><small>TO</small><h3>{to}</h3><b>{bus.arrival}</b></div></div><div className="mt-5 rounded-xl bg-panel p-3 text-sm"><b>{bus.operator}</b> · {bus.type}<span className="block text-muted">{dateLabel(date)}</span></div></ReviewCard>
            <ReviewCard title="Seats & passengers" edit="Edit details" onEdit={editPassengers}>{passengers.map((p, i) => <div key={seats[i]} className="flex items-center justify-between border-b border-line py-3 last:border-0"><span><b>{p.name}</b><small className="block text-muted">{p.age} years · {p.gender}</small></span><span className="badge-brand">Seat {seats[i]}</span></div>)}<button className="mt-3 text-xs font-bold text-brand" onClick={editSeats}>Edit seats</button></ReviewCard>
            <ReviewCard title="Boarding & dropping" edit="Edit stops" onEdit={editPassengers}><Stop title="Boarding point" value={boarding} /><div className="my-3 h-5 border-l border-dashed border-brand/40" /><Stop title="Dropping point" value={dropping} /></ReviewCard>
          </section>
          <aside className="summary-card h-fit"><p className="eyebrow">Price details</p><h2 className="text-lg font-extrabold">Fare breakdown</h2><div className="my-5 space-y-3 border-y border-dashed border-line py-5 text-sm"><Line label={`Base fare (${seats.length} seats)`} value={`₹${seats.length * bus.price}`} /><Line label="Taxes & service fees" value={`₹${tax}`} /></div><div className="mb-5 flex items-end justify-between"><b>Total amount</b><b className="text-2xl">₹{total}</b></div><button className="primary-button w-full" onClick={next}>Proceed to payment <Icon name="chevron" className="size-4" /></button><p className="mt-3 text-center text-xs text-muted"><Icon name="shield" className="mr-1 inline size-3.5 text-success" />Secure booking</p></aside>
        </div>
      </main>
    </>
  );
}
function ReviewCard({ title, edit, onEdit, children }: { title: string; edit: string; onEdit: () => void; children: React.ReactNode }) { return <div className="form-card"><div className="mb-5 flex justify-between"><h2 className="font-extrabold">{title}</h2><button className="text-xs font-bold text-brand" onClick={onEdit}><Icon name="edit" className="mr-1 inline size-3.5" />{edit}</button></div>{children}</div>; }
function Stop({ title, value }: { title: string; value: string }) { return <div className="flex gap-3"><Icon name="pin" className="size-5 text-brand" /><span><small className="block text-muted">{title}</small><b className="text-sm">{value}</b></span></div>; }

function Payment({ total, back, pay }: { total: number; back: () => void; pay: () => void }) {
  const [method, setMethod] = useState<PaymentMethod>("upi"); const [upi, setUpi] = useState(""); const [verified, setVerified] = useState(false); const [processing, setProcessing] = useState(false);
  const methods: [PaymentMethod, string][] = [["upi", "UPI"], ["card", "Credit / Debit Card"], ["netbanking", "Net Banking"], ["wallet", "Wallet"]];
  const submit = () => { setProcessing(true); setTimeout(pay, 900); };
  return (
    <>
      <Progress step={4} /><PageTop back={back} title="Secure payment" subtitle="Your booking is held for 09:42 minutes" />
      <main className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-payment">
          <aside className="overflow-hidden rounded-2xl border border-line bg-white">{methods.map(([id, label]) => <button key={id} className={`payment-tab ${method === id ? "payment-tab-active" : ""}`} onClick={() => setMethod(id)}><Icon name={id === "card" ? "card" : id === "upi" ? "ticket" : "shield"} className="size-5" />{label}<Icon name="chevron" className="ml-auto size-4" /></button>)}</aside>
          <section className="form-card">
            <p className="eyebrow">Pay ₹{total}</p><h1 className="mb-6 text-2xl font-extrabold">{methods.find((m) => m[0] === method)?.[1]}</h1>
            {method === "upi" && <div><Field label="UPI ID"><div className="flex gap-2"><input value={upi} onChange={(e) => { setUpi(e.target.value); setVerified(false); }} placeholder="name@bank" /><button className="secondary-button shrink-0" onClick={() => setVerified(upi.includes("@"))}>Verify</button></div></Field>{verified && <p className="mt-3 text-sm font-bold text-success"><Icon name="check" className="mr-1 inline size-4" />UPI ID verified</p>}</div>}
            {method === "card" && <div className="space-y-4"><Field label="Card number"><input placeholder="1234 5678 9012 3456" maxLength={19} /></Field><div className="grid grid-cols-2 gap-4"><Field label="Expiry date"><input placeholder="MM / YY" /></Field><Field label="CVV"><input placeholder="•••" maxLength={3} /></Field></div><Field label="Cardholder name"><input placeholder="Name on card" /></Field></div>}
            {method === "netbanking" && <Field label="Choose your bank"><select><option>HDFC Bank</option><option>State Bank of India</option><option>ICICI Bank</option><option>Axis Bank</option></select></Field>}
            {method === "wallet" && <div className="grid grid-cols-2 gap-3">{["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"].map((w) => <button className="wallet-option" key={w}>{w}</button>)}</div>}
            <div className="mt-8 rounded-xl bg-success-soft p-3 text-xs text-success"><Icon name="shield" className="mr-2 inline size-4" />Payments are encrypted and secure. This prototype will not charge you.</div>
            <button className="primary-button mt-5 w-full" disabled={processing || (method === "upi" && !verified)} onClick={submit}>{processing ? "Processing securely…" : `Pay ₹${total}`}</button>
          </section>
        </div>
      </main>
    </>
  );
}

function Confirmation({ bus, from, to, date, seats, passengers, boarding, dropping, total, home, bookings }: {
  bus: Bus; from: string; to: string; date: string; seats: string[]; passengers: Passenger[]; boarding: string; dropping: string; total: number; home: () => void; bookings: () => void;
}) {
  const [downloaded, setDownloaded] = useState(false);
  return (
    <main className="confirmation-bg min-h-[calc(100vh-4.5rem)] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto grid size-18 place-items-center rounded-full bg-success text-white shadow-lg"><Icon name="check" className="size-9" /></div>
        <p className="eyebrow mt-5">Payment successful</p><h1 className="text-3xl font-extrabold sm:text-4xl">Booking confirmed!</h1><p className="mt-2 text-muted">Your ticket has been sent to your email and mobile.</p>
        <div className="ticket-card mt-8 text-left">
          <div className="ticket-head"><div><small>BOOKING ID / PNR</small><h2>GBX847291</h2></div><span className="badge-success">CONFIRMED</span></div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4"><div><small>FROM</small><h3>{from.split(",")[0]}</h3><b>{bus.departure}</b></div><div className="route-line"><span>{bus.duration}</span></div><div className="text-right"><small>TO</small><h3>{to.split(",")[0]}</h3><b>{bus.arrival}</b></div></div>
            <div className="my-6 grid gap-4 border-y border-dashed border-line py-6 sm:grid-cols-ticket">
              <div className="space-y-3 text-sm"><Line label="Operator" value={bus.operator} /><Line label="Bus type" value={bus.type} /><Line label="Journey date" value={dateLabel(date)} /><Line label="Seats" value={seats.join(", ")} /><Line label="Passengers" value={passengers.map((p) => p.name).join(", ")} /></div>
              <div className="qr"><div className="qr-pattern" /><small>Scan ticket</small></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2"><Stop title="Boarding point" value={boarding} /><Stop title="Dropping point" value={dropping} /></div>
            <div className="mt-6 flex items-center justify-between rounded-xl bg-panel p-4"><b>Total paid</b><b className="text-2xl">₹{total}</b></div>
          </div>
        </div>
        {downloaded && <p className="mt-4 text-sm font-bold text-success">Ticket downloaded successfully (prototype)</p>}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button className="secondary-button" onClick={() => setDownloaded(true)}><Icon name="download" className="size-4" /> Download ticket</button><button className="secondary-button" onClick={bookings}>View booking</button><button className="primary-button" onClick={home}>Go to home</button></div>
      </div>
    </main>
  );
}

function Bookings({ bus, from, to, date, seats, confirmed, viewTicket }: { bus: Bus | null; from: string; to: string; date: string; seats: string[]; confirmed: boolean; viewTicket: () => void }) {
  const [tab, setTab] = useState("Upcoming"); const [cancelled, setCancelled] = useState(false);
  const examples = tab === "Completed" ? [{ id: "GBX639201", op: "NueGo Electric", route: "Pune → Mumbai", date: "12 Jan 2026", seats: "4A", status: "Completed" }] : tab === "Cancelled" ? [{ id: "GBX501924", op: "Orange Travels", route: "Chennai → Madurai", date: "08 Dec 2025", seats: "L3", status: "Cancelled" }] : [];
  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-5xl px-5 py-10 lg:px-8">
      <p className="eyebrow">Your journeys</p><h1 className="text-3xl font-extrabold">My Bookings</h1>
      <div className="my-7 flex gap-2 overflow-x-auto">{["Upcoming", "Completed", "Cancelled"].map((t) => <button key={t} className={tab === t ? "filter-chip-active" : "filter-chip"} onClick={() => setTab(t)}>{t} trips</button>)}</div>
      <div className="space-y-4">
        {tab === "Upcoming" && confirmed && !cancelled && bus && <BookingCard id="GBX847291" op={bus.operator} route={`${from.split(",")[0]} → ${to.split(",")[0]}`} date={dateLabel(date)} seats={seats.join(", ")} status="Confirmed" onView={viewTicket} onCancel={() => setCancelled(true)} />}
        {examples.map((x) => <BookingCard key={x.id} {...x} onView={() => alert("Ticket preview opened.")} />)}
        {((tab === "Upcoming" && (!confirmed || cancelled)) || (tab === "Completed" && !examples.length) || (tab === "Cancelled" && !examples.length)) && <div className="empty-state"><Icon name="ticket" className="size-10 text-brand" /><h3>No {tab.toLowerCase()} trips</h3><p>Your bookings will appear here.</p></div>}
      </div>
    </main>
  );
}
function BookingCard({ id, op, route, date, seats, status, onView, onCancel }: { id: string; op: string; route: string; date: string; seats: string; status: string; onView: () => void; onCancel?: () => void }) {
  return <article className="form-card"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="mb-2 flex gap-2"><span className={status === "Cancelled" ? "badge-muted" : "badge-success"}>{status}</span><small className="self-center text-muted">Booking ID {id}</small></div><h2 className="text-lg font-extrabold">{route}</h2><p className="mt-1 text-sm text-muted">{op} · {date} · Seats {seats}</p></div><div className="flex gap-2"><button className="secondary-button" onClick={onView}>View ticket</button>{onCancel && <button className="danger-button" onClick={onCancel}>Cancel booking</button>}</div></div></article>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [from, setFrom] = useState("Bengaluru, Karnataka");
  const [to, setTo] = useState("Chennai, Tamil Nadu");
  const [journeyDate, setJourneyDate] = useState(tomorrowISO());
  const [returnDate, setReturnDate] = useState("");
  const [bus, setBus] = useState<Bus | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [boarding, setBoarding] = useState("");
  const [dropping, setDropping] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const go = (next: Page) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const selectBus = (value: Bus) => { setBus(value); setSeats([]); go("seats"); };
  const toPassengers = () => {
    setPassengers(seats.map((_, i) => passengers[i] || { name: "", age: "", gender: "" }));
    go("passengers");
  };
  const total = useMemo(() => bus ? Math.round(seats.length * bus.price * 1.05) : 0, [bus, seats]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header page={page} go={go} />
      {page === "home" && <Home from={from} to={to} setFrom={setFrom} setTo={setTo} journeyDate={journeyDate} setJourneyDate={setJourneyDate} returnDate={returnDate} setReturnDate={setReturnDate} search={() => go("results")} />}
      {page === "results" && <Results from={from} to={to} date={journeyDate} onBack={() => go("home")} onSelect={selectBus} />}
      {page === "seats" && bus && <SeatSelection bus={bus} from={from} to={to} date={journeyDate} selected={seats} setSelected={setSeats} back={() => go("results")} next={toPassengers} />}
      {page === "passengers" && <PassengerDetails seats={seats} passengers={passengers} setPassengers={setPassengers} mobile={mobile} setMobile={setMobile} email={email} setEmail={setEmail} boarding={boarding} setBoarding={setBoarding} dropping={dropping} setDropping={setDropping} back={() => go("seats")} next={() => go("review")} />}
      {page === "review" && bus && <Review bus={bus} from={from} to={to} date={journeyDate} seats={seats} passengers={passengers} boarding={boarding} dropping={dropping} total={total} back={() => go("passengers")} editSeats={() => go("seats")} editPassengers={() => go("passengers")} editJourney={() => go("home")} next={() => go("payment")} />}
      {page === "payment" && <Payment total={total} back={() => go("review")} pay={() => { setConfirmed(true); go("confirmation"); }} />}
      {page === "confirmation" && bus && <Confirmation bus={bus} from={from} to={to} date={journeyDate} seats={seats} passengers={passengers} boarding={boarding} dropping={dropping} total={total} home={() => go("home")} bookings={() => go("bookings")} />}
      {page === "bookings" && <Bookings bus={bus} from={from} to={to} date={journeyDate} seats={seats} confirmed={confirmed} viewTicket={() => go("confirmation")} />}
    </div>
  );
}
