const DashboardSkeleton = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-pulse">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-zinc-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-zinc-50 p-4 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-5 rounded-[2rem] border border-zinc-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="lg:col-span-4 bg-white rounded-[2rem] border border-zinc-100">
          <div className="p-5 bg-zinc-50/50 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-2 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-2 bg-gray-200 rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;