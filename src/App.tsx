import { useState, useMemo } from 'react';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { supabase } from './lib/supabase';
import { collectTechnicalMetadata, getGeolocation } from './lib/metadata';

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      // Collect technical metadata
      const technicalData = collectTechnicalMetadata();

      // Get geolocation (non-blocking)
      const geoData = await getGeolocation();

      // Merge location data
      const metadata = {
        ...technicalData,
        location: {
          ...technicalData.location,
          ...geoData,
        },
      };

      const { error: dbError } = await supabase
        .from('waitlist')
        .insert([{ email, metadata }]);

      if (dbError) {
        if (dbError.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          setError('Something went wrong. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random heights for animated bars - memoized to prevent re-renders
  const bars = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      height: Math.random() * 60 + 20,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
    }))
    , []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Bars */}
      <div className="absolute inset-0 flex items-end justify-around opacity-20 pointer-events-none">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className="w-1 bg-white rounded-t-full animate-flow"
            style={{
              height: `${bar.height}%`,
              animationDelay: `${bar.delay}s`,
              animationDuration: `${bar.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-xl relative z-10">
        {!isSubmitted ? (
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm mb-8">
              <Users className="w-4 h-4" />
              <span>Coming Q1 2026</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Build apps with<br />
              <span className="text-white/60">AI-powered code</span>
            </h1>

            {/* Subheading */}
            <p className="text-white/60 text-lg mb-12 max-w-lg mx-auto">
              Join the waitlist for Codegrey - the AI that turns your ideas<br />
              into production-ready applications.
            </p>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex items-center gap-2 max-w-md mx-auto bg-white/5 border border-white/20 rounded-full p-2 backdrop-blur-sm">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent px-4 py-2 outline-none placeholder-white/40 text-white"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Join
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-black" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-black" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 border-2 border-black" />
              </div>
              <span>Trusted by 99+ early joiners</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome aboard!</h2>
            <p className="text-white/60 text-lg">
              You're now on the exclusive early access list.<br />
              We'll reach out soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
