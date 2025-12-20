export default function MovieLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      {/* Film reel animation */}
      <div className="relative">
        {/* Main circle */}
        <div className="w-24 h-24 border-4 border-accent/30 rounded-full animate-spin">
          <div className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        
        {/* Film holes decoration */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
      </div>

      {/* Loading text with dots animation */}
      <div className="flex items-center space-x-2">
        <span className="text-xl text-gray-300 font-semibold">Učitavanje filma</span>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent to-secondary animate-pulse"></div>
      </div>

      {/* Film strip decoration */}
      <div className="flex space-x-2 mt-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="w-12 h-16 bg-gray-800 border-2 border-accent/50 rounded animate-pulse flex flex-col justify-between p-1"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="w-2 h-2 bg-accent/30 rounded-full"></div>
            <div className="w-2 h-2 bg-accent/30 rounded-full"></div>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-sm mt-4">Molimo sačekajte...</p>
    </div>
  );
}
