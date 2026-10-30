sed -i '/Pincode \/ Postal Code/i \
                  <div className="flex flex-col gap-1.5">\
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">State / Province</label>\
                    <input\
                      type="text"\
                      required\
                      value={state}\
                      onChange={(e) => setState(e.target.value)}\
                      autoComplete="address-level1"\
                      placeholder="e.g. Maharashtra"\
                      className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-yellow-600 focus:bg-white"\
                    />\
                  </div>' src/pages/Checkout.tsx
