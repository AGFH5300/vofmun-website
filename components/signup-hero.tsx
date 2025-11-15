import { Calendar, Users, MapPin } from "lucide-react"

export function SignupHero() {
  return (
    <section className="py-12 sm:py-16 md:py-20" style={{ backgroundColor: "#ffecdd" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">Join VOFMUN 2026</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Secure your place at the premier youth-driven Model United Nations conference. Experience diplomatic
            excellence, engage with global challenges, and connect with future leaders from around the world.
          </p>

          {/* Key Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <div className="flex flex-col items-center space-y-2 p-3 sm:p-4 bg-white/80 rounded-lg shadow-md">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">February 14-15, 2026</div>
                <div className="text-xs sm:text-sm text-gray-600">Conference Dates</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 sm:p-4 bg-white/80 rounded-lg shadow-md">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">
                  UKCBC Dubai Campus
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Academic City
                </div>
                <a
                  href="https://maps.app.goo.gl/jx4SsR7r58oauhedA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#B22222] hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 sm:p-4 bg-white/80 rounded-lg shadow-md sm:col-span-2 md:col-span-1">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">250+ Delegates</div>
                <div className="text-xs sm:text-sm text-gray-600">Expected Attendance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
