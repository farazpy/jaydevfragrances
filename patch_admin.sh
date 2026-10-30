sed -i '590c\
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">' src/pages/Admin.tsx

sed -i '606a\
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">\
                <span className="text-[9px] font-mono tracking-widest uppercase text-gray-400 font-bold">Total Page Views</span>\
                <span className="text-xl sm:text-2xl font-bold font-mono">{stats.views} Views</span>\
              </div>\
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">\
                <span className="text-[9px] font-mono tracking-widest uppercase text-gray-400 font-bold">Total Sessions</span>\
                <span className="text-xl sm:text-2xl font-bold font-mono">{stats.sessions} Sessions</span>\
              </div>' src/pages/Admin.tsx
