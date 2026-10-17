import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BLOOD_GROUPS } from '../utils/bloodCompat';
import {
  DropletIcon,
  HeartIcon,
  HospitalIcon,
  BuildingIcon,
  SearchIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../components/common/Icons';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [searchGroup, setSearchGroup] = useState('O+');
  const [searchLocation, setSearchLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;
    navigate(`/request?bloodType=${encodeURIComponent(searchGroup)}&location=${encodeURIComponent(searchLocation)}`);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location access is not available in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setLocating(false);
      },
      () => {
        setLocationError('Location access was unavailable. Enter a city or area instead.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="home-page space-y-20 pb-16">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-copy">
            <h1 className="home-title">
              Somewhere, someone needs you.<em>Be the reason hope arrives.</em>
            </h1>
            <p className="home-description">
              Find blood support, connect with potential donors, and make every step towards a life-saving donation simpler.
            </p>
            <div className="home-actions">
              <Link to="/request" className="home-primary-action">
                <DropletIcon className="h-5 w-5" /> Find blood nearby <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/register?role=donor" className="home-secondary-action">
                Become a donor <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="home-trust-note">
              <span className="home-trust-mark"><HeartIcon className="h-4 w-4" /></span>
              <p>One clear path between an urgent need and someone willing to help.</p>
            </div>
          </div>

          <div className="home-visual">
            <div className="home-photo-frame">
              <img
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=85"
                alt="A healthcare worker carefully handling a blood donation bag"
                fetchPriority="high"
              />
              <div className="home-photo-caption">
                <span>Care, connected.</span>
                <span>01 / 04</span>
              </div>
            </div>
            <div className="home-photo-note">
              <span className="home-note-rule" />
              <p>For donors, families, hospitals<br />and blood banks across India.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-search-wrap" aria-labelledby="home-search-title">
        <div className="home-search-heading">
          <p className="home-section-kicker">A good place to begin</p>
          <h2 id="home-search-title">Find a match, closer to home.</h2>
          <p>Choose a blood group and location to start a request.</p>
        </div>
        <form className="home-search-form" onSubmit={handleSearchSubmit}>
          <fieldset className="home-blood-field">
            <legend>Blood group needed</legend>
            <div className="home-blood-options">
              {BLOOD_GROUPS.map((group) => (
                <button
                  type="button"
                  key={group}
                  aria-pressed={searchGroup === group}
                  onClick={() => setSearchGroup(group)}
                  className={searchGroup === group ? 'is-selected' : ''}
                >
                  {group}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="home-location-field">
            <label htmlFor="home-location">City, area, or hospital</label>
            <div className="home-location-control">
              <MapPinIcon className="h-4 w-4" />
              <input
                id="home-location"
                type="text"
                required
                value={searchLocation}
                onChange={(event) => {
                  setSearchLocation(event.target.value);
                  setLocationError('');
                }}
                placeholder="e.g. AIIMS, New Delhi"
              />
              <button type="button" onClick={handleUseLocation} disabled={locating} aria-label="Use current location">
                {locating ? 'Locating…' : 'Use my location'}
              </button>
            </div>
            {locationError && <p className="home-location-error" role="status">{locationError}</p>}
          </div>
          <button className="home-search-submit" type="submit">
            <SearchIcon className="h-4 w-4" /> Search blood <ArrowRightIcon className="h-4 w-4" />
          </button>
        </form>
        <p className="home-search-disclaimer">Availability depends on participating donors and blood banks in your area.</p>
      </section>

      {/* 2. How the Platform Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blood-600 bg-blood-50 px-3 py-1 rounded-full border border-blood-200">
            Emergency Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How Jeevansh Works</h2>
          <p className="text-gray-600 text-base">
            Designed for rapid action when every minute counts. A transparent three-step coordination cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <Card className="border-t-4 border-t-blood-600 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blood-50 text-blood-700 font-black text-xl flex items-center justify-center mb-6">
              01
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request or Search</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Patients or hospital coordinators specify required blood group, units, and hospital location. The system immediately scans local bank stocks and nearby verified volunteer donors.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="border-t-4 border-t-amber-500 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-black text-xl flex items-center justify-center mb-6">
              02
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Proximity Alert</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Compatible donors within a 15 km radius receive prioritized notifications. Available donors accept with one tap, locking in emergency coordination without delays.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="border-t-4 border-t-emerald-600 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xl flex items-center justify-center mb-6">
              03
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Contact & Verification</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              The seeker is connected directly with the confirmed donor. When donating at the hospital or blood bank, a secure QR check-in verifies the donation and logs the life saved.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Cards Highlighting Donors, Blood Banks, and Hospitals */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blood-600 bg-blood-50 px-3 py-1 rounded-full border border-blood-200">
            Coordinated Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Built for Every Healthcare Stakeholder</h2>
          <p className="text-gray-600 text-base">
            Seamless portals tailored to individual donors, emergency seekers, licensed blood banks, and hospital emergency desks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Donors Card */}
          <Card className="flex flex-col justify-between hover:border-blood-200 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-100 text-blood-700 flex items-center justify-center mb-5">
                <HeartIcon className="w-6 h-6 text-blood-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">For Volunteer Donors</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Receive emergency blood alerts only when someone near you is in genuine need. Track your donation milestones, verify via QR at the bank, and manage your availability toggle.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Proximity alerts within 15 km of your location</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal impact badges & cooldown tracker</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Digital QR token for clinical verification</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register?role=donor"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-blood-600 text-blood-600 hover:bg-blood-50 transition"
            >
              <span>Join as Volunteer Donor</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Card>

          {/* Blood Banks Card */}
          <Card className="flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <BuildingIcon className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">For Blood Banks</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Maintain live digital inventory of Whole Blood, Platelets, PRBC, and FFP. Scan donor check-in QR codes, reduce blood wastage, and streamline regional hospital coordination.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Component stock registry across all 8 blood groups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>In-built camera & demo QR donation scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Government / NACO accreditation badges</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login?role=bank"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition"
            >
              <span>Blood Bank Portal</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Card>

          {/* Hospitals Card */}
          <Card className="flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <HospitalIcon className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">For Hospitals & Clinics</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Hospital emergency desks can post critical patient requisitions, search regional blood bank inventories, and track volunteer arrival times in real time.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Immediate patient requisitions with clinical urgency tags</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time requisition timeline monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-unit emergency request capabilities</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login?role=hospital"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition"
            >
              <span>Hospital Requisition Desk</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Card>
        </div>
      </section>

      {/* 4. Encouraging Blood Donation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blood-800 to-blood-950 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-red-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Why Donate Blood?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              One Donation Can Save Up to Three Lives.
            </h2>
            <p className="text-red-100 text-base sm:text-lg leading-relaxed">
              Every two seconds, someone in India needs blood. From surgical emergencies to cancer treatments and trauma care, voluntary donors are the only lifeline. Blood cannot be manufactured — it can only come as a generous gift.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-black text-white">450 ml</p>
                <p className="text-xs text-red-200 mt-1">Average unit of whole blood donated</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-black text-white">90 Days</p>
                <p className="text-xs text-red-200 mt-1">Standard safe interval between whole blood donations</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-black text-white">10 Mins</p>
                <p className="text-xs text-red-200 mt-1">Actual time taken for blood draw</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register?role=donor"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-blood-900 hover:bg-red-50 transition shadow-lg"
              >
                Register as Voluntary Donor
              </Link>
              <Link
                to="/request"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm border-2 border-white/40 text-white hover:bg-white/10 transition"
              >
                Find Blood Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Medical Eligibility & Guidelines Checklist */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border border-gray-200 p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 rounded-xl bg-blood-50 text-blood-700">
              <ShieldCheckIcon className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Basic Donor Eligibility Guidelines</h3>
              <p className="text-xs text-gray-500">Please review before registering. Clinical screening is performed at the donation center.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Age between <strong>18 and 65 years</strong> in general good health.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Weight at least <strong>45 kg to 50 kg</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Hemoglobin level of <strong>12.5 g/dL or higher</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>At least <strong>90 days</strong> since your last whole blood donation.</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}