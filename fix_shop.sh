sed -i '229,230c\
            ) : loading ? (\
              <div className="flex justify-center items-center py-20">\
                <Preloader text="Curating Collection..." />\
              </div>\
            ) : products.length === 0 ? (\
              <div className="text-center py-20">\
                <p className="text-gray-500 font-serif">No fragrances found matching your criteria.</p>\
                <button onClick={handleResetFilters} className="mt-4 text-xs font-bold uppercase tracking-wider text-yellow-600 underline">Reset Filters</button>\
              </div>\
            ) : (\
              <>' src/pages/Shop.tsx
