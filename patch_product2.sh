sed -i '296a\
            </div>\
            <div className="flex flex-col sm:flex-row gap-4 mt-2">\
              <button\
                onClick={handleBuyNow}\
                disabled={!selectedVariant || selectedVariant.stock <= 0}\
                className="flex-1 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-serif font-bold text-xs uppercase tracking-widest rounded-full shadow hover:scale-102 active:scale-98 transition-all duration-300 disabled:opacity-40 disabled:hover:bg-yellow-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"\
              >\
                <ShoppingBag className="w-4 h-4" /> Buy Now\
              </button>\
' src/pages/ProductDetail.tsx
