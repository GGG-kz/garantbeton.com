export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-mono-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-black font-semibold">Загрузка...</p>
      </div>
    </div>
  )
}
